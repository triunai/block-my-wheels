# Sticker RPC Function Migration

## Problem
The current database schema is missing a `create_sticker` RPC function, which is needed for proper sticker creation and saving.

## Solution
Run this SQL in your Supabase SQL editor to add the missing function:

```sql
-- Migration: Add create_sticker RPC function
CREATE OR REPLACE FUNCTION create_sticker(
    p_plate TEXT,
    p_style TEXT DEFAULT 'modern',
    p_token TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_token TEXT;
    v_sticker_record RECORD;
BEGIN
    -- Get the current authenticated user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'User not authenticated'
        );
    END IF;
    
    -- Generate token if not provided
    IF p_token IS NULL THEN
        v_token := generate_qr_token();
    ELSE
        v_token := p_token;
    END IF;
    
    -- Insert the sticker
    INSERT INTO stickers (owner_id, token, plate, style, status)
    VALUES (v_user_id, v_token, p_plate, p_style, 'active')
    RETURNING * INTO v_sticker_record;
    
    -- Return success with sticker data
    RETURN json_build_object(
        'success', true,
        'data', row_to_json(v_sticker_record)
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false, 
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_sticker(TEXT, TEXT, TEXT) TO authenticated;
```

## What This Adds
- Proper authentication check using `auth.uid()`
- Uses the existing `generate_qr_token()` function for unique tokens
- Inserts into the `stickers` table with correct `owner_id` reference
- Returns proper JSON response with success/error handling
- Proper security definer for RLS compliance

## Current Workaround
The app currently uses direct table inserts which work but bypass the proper RPC layer. This function should be added for consistency and better error handling. 