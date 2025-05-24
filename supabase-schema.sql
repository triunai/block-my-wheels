
-- AI Driver Alert System Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    wa_id VARCHAR(50), -- WhatsApp ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stickers table
CREATE TABLE IF NOT EXISTS stickers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    plate TEXT,
    style TEXT DEFAULT 'modern',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sticker_id UUID REFERENCES stickers(id) ON DELETE CASCADE,
    rage INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('open', 'ack', 'closed')) DEFAULT 'open',
    scanner_ip INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ack_at TIMESTAMPTZ,
    eta_minutes INTEGER,
    closed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stickers_token ON stickers(token);
CREATE INDEX IF NOT EXISTS idx_stickers_driver_id ON stickers(driver_id);
CREATE INDEX IF NOT EXISTS idx_incidents_sticker_id ON incidents(sticker_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);

-- Row Level Security Policies
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Drivers policies
CREATE POLICY "Users can view their own driver profile" ON drivers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own driver profile" ON drivers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own driver profile" ON drivers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stickers policies (readable by anyone for scanning, manageable by owner)
CREATE POLICY "Stickers are viewable by everyone" ON stickers
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage their own stickers" ON stickers
    FOR ALL USING (
        driver_id IN (
            SELECT id FROM drivers WHERE user_id = auth.uid()
        )
    );

-- Incidents policies (readable for scanning, manageable by sticker owner)
CREATE POLICY "Incidents are viewable by everyone" ON incidents
    FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can create incidents" ON incidents
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Sticker owners can update their incidents" ON incidents
    FOR UPDATE USING (
        sticker_id IN (
            SELECT s.id FROM stickers s
            JOIN drivers d ON s.driver_id = d.id
            WHERE d.user_id = auth.uid()
        )
    );

-- RPC Functions

-- Fetch scan page data (sticker + current incident)
CREATE OR REPLACE FUNCTION fetch_scan_page(token TEXT)
RETURNS JSON AS $$
DECLARE
    sticker_data JSON;
    incident_data JSON;
    result JSON;
BEGIN
    -- Get sticker with driver info
    SELECT to_json(s.*) INTO sticker_data
    FROM stickers s
    WHERE s.token = fetch_scan_page.token AND s.active = TRUE;
    
    IF sticker_data IS NULL THEN
        RAISE EXCEPTION 'Invalid or inactive sticker token';
    END IF;
    
    -- Get or create open incident for this sticker
    SELECT to_json(i.*) INTO incident_data
    FROM incidents i
    WHERE i.sticker_id = (sticker_data->>'id')::UUID 
    AND i.status IN ('open', 'ack')
    ORDER BY i.created_at DESC
    LIMIT 1;
    
    -- If no open incident exists, create one
    IF incident_data IS NULL THEN
        INSERT INTO incidents (sticker_id, scanner_ip)
        VALUES (
            (sticker_data->>'id')::UUID,
            inet_client_addr()
        )
        RETURNING to_json(incidents.*) INTO incident_data;
    END IF;
    
    -- Build result
    result := json_build_object(
        'sticker', sticker_data,
        'incident', incident_data
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify driver function
CREATE OR REPLACE FUNCTION notify_driver(token TEXT, rage INTEGER DEFAULT 0)
RETURNS JSON AS $$
DECLARE
    incident_id UUID;
    result JSON;
BEGIN
    -- Find the current open incident for this token
    SELECT i.id INTO incident_id
    FROM incidents i
    JOIN stickers s ON i.sticker_id = s.id
    WHERE s.token = notify_driver.token 
    AND i.status = 'open'
    ORDER BY i.created_at DESC
    LIMIT 1;
    
    IF incident_id IS NULL THEN
        RAISE EXCEPTION 'No open incident found for token';
    END IF;
    
    -- Update incident with rage increment
    UPDATE incidents 
    SET rage = rage + notify_driver.rage,
        updated_at = NOW()
    WHERE id = incident_id
    RETURNING to_json(incidents.*) INTO result;
    
    -- Here you would typically call n8n webhook
    -- For now, we'll just log the notification
    RAISE NOTICE 'Driver notification triggered for incident %', incident_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Acknowledge incident function
CREATE OR REPLACE FUNCTION ack_incident(incident_id UUID, eta_minutes INTEGER DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Update incident status to acknowledged
    UPDATE incidents 
    SET status = 'ack',
        ack_at = NOW(),
        eta_minutes = ack_incident.eta_minutes
    WHERE id = incident_id
    AND status = 'open'
    RETURNING to_json(incidents.*) INTO result;
    
    IF result IS NULL THEN
        RAISE EXCEPTION 'Incident not found or already acknowledged';
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sticker function
CREATE OR REPLACE FUNCTION create_sticker(plate TEXT, style TEXT DEFAULT 'modern')
RETURNS JSON AS $$
DECLARE
    new_token TEXT;
    driver_id UUID;
    result JSON;
BEGIN
    -- Generate unique token
    new_token := encode(gen_random_bytes(16), 'hex');
    
    -- Get or create driver for current user
    SELECT id INTO driver_id FROM drivers WHERE user_id = auth.uid();
    
    IF driver_id IS NULL THEN
        -- Create driver record (requires phone number in real implementation)
        INSERT INTO drivers (user_id, phone)
        VALUES (auth.uid(), 'pending')
        RETURNING id INTO driver_id;
    END IF;
    
    -- Create sticker
    INSERT INTO stickers (driver_id, token, plate, style)
    VALUES (driver_id, new_token, plate, style)
    RETURNING to_json(stickers.*) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert some demo data
INSERT INTO drivers (id, user_id, phone, wa_id) VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '+1234567890', 'demo_wa_id')
ON CONFLICT DO NOTHING;

INSERT INTO stickers (id, driver_id, token, plate, style) VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'demo', 'DEMO-123', 'modern')
ON CONFLICT DO NOTHING;
