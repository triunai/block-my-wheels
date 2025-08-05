-- Block My Wheels Database Diagnostics
-- Run these queries in your Supabase SQL editor to diagnose RLS and profile issues

-- ===========================================
-- 1. CHECK EXISTING PROFILES
-- ===========================================
SELECT COUNT(*) as total_profiles
FROM user_profiles;

-- ===========================================
-- 2. VERIFY UUID MATCHING
-- ===========================================
SELECT
    up.id AS profile_id,
    au.id AS auth_user_id,
    CASE WHEN up.id = au.id THEN 'MATCHED' ELSE 'UNMATCHED' END AS match_status
FROM
    user_profiles up
    FULL OUTER JOIN
    auth.users au ON up.id = au.id;

-- ===========================================
-- 3. CHECK FOR ORPHANED RECORDS
-- ===========================================
    SELECT
        'Orphaned Auth Users (no profile)' AS category,
        COUNT(*) AS count
    FROM
        auth.users au
        LEFT JOIN
        user_profiles up ON au.id = up.id
    WHERE 
    up.id IS NULL

UNION ALL

    SELECT
        'Orphaned Profiles (no auth user)' AS category,
        COUNT(*) AS count
    FROM
        user_profiles up
        LEFT JOIN
        auth.users au ON up.id = au.id
    WHERE 
    au.id IS NULL;

-- ===========================================
-- 4. CHECK CURRENT RLS POLICIES
-- ===========================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE 
    tablename = 'user_profiles';

-- ===========================================
-- 5. CHECK IF RLS IS ENABLED
-- ===========================================
SELECT
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as rls_forced
FROM
    pg_class
WHERE 
    relname = 'user_profiles';

-- ===========================================
-- 6. CHECK AUTHENTICATION CONTEXT (when logged in)
-- ===========================================
SELECT
    auth.uid() AS current_user_id,
    auth.role() AS current_user_role;

-- ===========================================
-- 7. RECOMMENDED RLS POLICIES
-- ===========================================

-- First, drop existing policies if needed:
-- DROP POLICY IF EXISTS "policy_name" ON user_profiles;

-- Enable RLS on the table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to see their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR
SELECT
    USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR
UPDATE
USING (auth.uid()
= id);

-- Policy 3: Allow new users to create their initial profile
CREATE POLICY "Users can create initial profile"
ON user_profiles
FOR
INSERT
WITH CHECK (
    auth.uid() =
id
AND
NOT
EXISTS
(
        SELECT 1
FROM user_profiles
WHERE id = auth.uid()
    )
);

-- Policy 4: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON user_profiles
FOR
SELECT
    USING (
    EXISTS (
        SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
        AND user_type = 'admin'
    )
);

-- Policy 5: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON user_profiles
FOR
UPDATE
USING (
    EXISTS (
        SELECT 1
FROM user_profiles
WHERE id = auth.uid()
    AND user_type = 'admin'
    )
);

-- ===========================================
-- 8. CREATE RPC FUNCTION FOR PROFILE CREATION
-- ===========================================
CREATE OR REPLACE FUNCTION create_profile_for_user
(user_id UUID)
RETURNS user_profiles AS $$
DECLARE
    new_profile user_profiles;
BEGIN
    INSERT INTO user_profiles
        (id, user_type, phone, total_incidents)
    VALUES
        (user_id, 'driver', NULL, 0)
    RETURNING * INTO new_profile;

RETURN new_profile;
EXCEPTION
    WHEN unique_violation THEN
-- Profile already exists
SELECT *
INTO new_profile
FROM user_profiles
WHERE id = user_id;
RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_profile_for_user
(UUID) TO authenticated;

-- ===========================================
-- 9. CHECK CONSTRAINTS ON user_profiles TABLE
-- ===========================================
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM
    pg_constraint
WHERE 
    conrelid = 'user_profiles'
::regclass;

-- ===========================================
-- 10. TEMPORARY: DISABLE RLS FOR TESTING
-- ===========================================
-- WARNING: Only use this for debugging!
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Remember to re-enable it:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY; 