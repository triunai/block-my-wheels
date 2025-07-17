-- paRQed Production-Ready Database Schema v1.3
-- SQL Engineer Mode: Simplified, Scalable, and Robust.

-- Enable necessary extensions
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION
IF NOT EXISTS "pg_net";

-- ============================================================================
-- ENUM TYPES (UDTs) - For Data Integrity and Performance
-- ============================================================================

CREATE TYPE user_type_enum AS ENUM
('driver', 'admin');
CREATE TYPE sticker_status_enum AS ENUM
('active', 'inactive', 'archived');
CREATE TYPE incident_status_enum AS ENUM
('open', 'acknowledged', 'resolved', 'expired');

-- ============================================================================
-- CORE TABLES (Refined)
-- ============================================================================

-- MERGED user_profiles table. This is now the central 'driver' entity.
CREATE TABLE user_profiles
(
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type user_type_enum NOT NULL DEFAULT 'driver',
    phone TEXT NOT NULL UNIQUE,
    -- The user's WhatsApp-enabled number.
    wa_id TEXT,
    -- The WhatsApp ID for direct messaging.
    -- Analytics fields moved from the 'drivers' table
    total_incidents INTEGER NOT NULL DEFAULT 0,
    avg_response_time_minutes DECIMAL(7,2),
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stickers (QR codes for vehicles) - Now references user_profiles directly.
CREATE TABLE stickers
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Simplified Foreign Key
    owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    plate TEXT,
    style TEXT DEFAULT 'modern',
    status sticker_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Incidents (Rage Events) - Unchanged, the design was solid.
CREATE TABLE incidents
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sticker_id UUID NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
    rage_level INTEGER NOT NULL CHECK (rage_level BETWEEN 0 AND 10),
    status incident_status_enum NOT NULL DEFAULT 'open',
    scanner_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    eta_minutes INTEGER,
    resolved_at TIMESTAMPTZ
);

-- Rate Limiting - Unchanged, the design was solid.
CREATE TABLE rate_limits
(
    identifier TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (identifier, window_start)
    -- More efficient composite PK
);

-- ============================================================================
-- ROW LEVEL SECURITY (Simplified)
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON user_profiles FOR ALL USING
(auth.uid
() = id);

ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stickers are publicly readable" ON stickers FOR
SELECT USING (true);
CREATE POLICY "Owners can manage their own stickers" ON stickers FOR ALL USING
(auth.uid
() = owner_id);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Incidents are publicly readable" ON incidents FOR
SELECT USING (true);
CREATE POLICY "Anyone can create incidents" ON incidents FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "Owners can update their incidents" ON incidents FOR
UPDATE USING (
    auth.uid()
=
(SELECT owner_id
FROM stickers
WHERE id = incidents.sticker_id)
);

-- ============================================================================
-- CORE FUNCTIONS (Refined)
-- ============================================================================

-- Function to generate a unique, human-readable token.
CREATE OR REPLACE FUNCTION generate_qr_token
()
RETURNS TEXT AS $$
BEGIN
    -- Loop to ensure the generated token is truly unique, though collisions are astronomically rare.
    LOOP
DECLARE
            new_token TEXT := 'P' || substr
(replace
(uuid_generate_v4
()::text, '-', ''), 1, 8);
BEGIN
    IF NOT EXISTS (SELECT 1
    FROM stickers
    WHERE token = new_token) THEN
    RETURN new_token;
END
IF;
        END;
END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;


-- ATOMIC rate limit function. Solves the race condition.
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit
(
  p_identifier TEXT,
  p_max_requests INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  v_window_start TIMESTAMPTZ := date_trunc
('minute', NOW
());
  v_request_count INTEGER;
BEGIN
    INSERT INTO rate_limits
        (identifier, window_start, request_count)
    VALUES
        (p_identifier, v_window_start, 1)
    ON CONFLICT
    (identifier, window_start)
  DO
    UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_request_count;

    RETURN v_request_count
    <= p_max_requests;
END;
$$ LANGUAGE plpgsql;

-- Get Rage Info Function - Maps rage levels to emojis and messages
CREATE OR REPLACE FUNCTION get_rage_info(p_rage_level INTEGER)
RETURNS JSON AS $$
DECLARE
    v_emoji TEXT;
    v_message TEXT;
    v_urgency TEXT;
BEGIN
    -- Map rage level to emoji and message
    CASE p_rage_level
        WHEN 0 THEN 
            v_emoji := '😐';
            v_message := 'Polite request to move vehicle';
            v_urgency := 'low';
        WHEN 1 THEN 
            v_emoji := '😐';
            v_message := 'Please move your vehicle when convenient';
            v_urgency := 'low';
        WHEN 2 THEN 
            v_emoji := '😕';
            v_message := 'Could you please move your vehicle?';
            v_urgency := 'low';
        WHEN 3 THEN 
            v_emoji := '😠';
            v_message := 'Please move your vehicle - blocking traffic';
            v_urgency := 'medium';
        WHEN 4 THEN 
            v_emoji := '😠';
            v_message := 'Vehicle is causing inconvenience - please move';
            v_urgency := 'medium';
        WHEN 5 THEN 
            v_emoji := '😡';
            v_message := 'URGENT: Please move your vehicle immediately';
            v_urgency := 'high';
        WHEN 6 THEN 
            v_emoji := '😡';
            v_message := 'URGENT: Vehicle blocking emergency access';
            v_urgency := 'high';
        WHEN 7 THEN 
            v_emoji := '🤬';
            v_message := 'CRITICAL: Move vehicle NOW - causing major disruption';
            v_urgency := 'critical';
        WHEN 8 THEN 
            v_emoji := '🤬';
            v_message := 'CRITICAL: Vehicle must be moved immediately';
            v_urgency := 'critical';
        WHEN 9 THEN 
            v_emoji := '🔥';
            v_message := 'EMERGENCY: Vehicle blocking emergency services';
            v_urgency := 'emergency';
        WHEN 10 THEN 
            v_emoji := '💀';
            v_message := 'MAXIMUM RAGE: Move this vehicle RIGHT NOW!';
            v_urgency := 'maximum';
        ELSE 
            v_emoji := '😐';
            v_message := 'Please move your vehicle';
            v_urgency := 'low';
    END CASE;

    RETURN json_build_object(
        'rage_level', p_rage_level,
        'emoji', v_emoji,
        'message', v_message,
        'urgency', v_urgency
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- THE CORE RPC (Simplified & More Robust)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_ping
(
  p_token TEXT,
  p_rage_level INTEGER,
  p_scanner_ip_text TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_sticker_owner RECORD;
  v_incident_id UUID;
  v_rage_info JSONB;
  v_webhook_url TEXT := 'http://localhost:5678/webhook/notify-driver';
-- Replace with production URL later
BEGIN
    -- 1. Validate Token & Fetch Owner Data (Single Query)
    SELECT p.phone, p.wa_id, s.id as sticker_id, s.plate
    INTO v_sticker_owner
    FROM stickers s
        JOIN user_profiles p ON s.owner_id = p.id
    WHERE s.token = p_token AND s.status = 'active';

    IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or inactive QR token');
END
IF;
  
    -- 2. ATOMIC Rate Limiting
    IF NOT check_and_increment_rate_limit(p_token, 5, 1) THEN
RETURN jsonb_build_object('success', false, 'error', 'Rate limit exceeded. Please wait a moment.');
END
IF;
  
    -- 3. Create Incident Record
    INSERT INTO incidents
    (sticker_id, rage_level, scanner_ip)
VALUES
    (v_sticker_owner.sticker_id, p_rage_level, p_scanner_ip_text::INET)
RETURNING id INTO v_incident_id;
  
    -- 4. Get Rage Info
    v_rage_info := get_rage_info
(p_rage_level)::jsonb;

    -- 5. Trigger n8n Webhook
    PERFORM net.http_post
(
        url := v_webhook_url,
        body := jsonb_build_object
(
            'incident_id', v_incident_id,
            'owner_phone', v_sticker_owner.phone,
            'owner_wa_id', v_sticker_owner.wa_id,
            'plate', v_sticker_owner.plate,
            'rage_info', v_rage_info
        )
    );

-- 6. Return Immediate Success to the Scanner
RETURN jsonb_build_object(
        'success', true,
        'incident_id', v_incident_id,
        'message', 'Notification is on its way.'
    );

EXCEPTION WHEN OTHERS THEN
RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;