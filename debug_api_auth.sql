-- Debug API Authentication Issues
-- This script helps identify why the API endpoint can't query the users table

-- ==============================================
-- 1. CHECK CURRENT AUTH CONTEXT
-- ==============================================

-- Check if we have an authenticated user
SELECT 'Auth Context Check:' as info;
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    current_user as db_user;

-- ==============================================
-- 2. TEST USER LOOKUP (This is what the API does)
-- ==============================================

-- Test the exact query the API endpoint uses
SELECT 'API User Lookup Test:' as info;
SELECT id, supabase_id 
FROM public.users 
WHERE supabase_id = auth.uid();

-- ==============================================
-- 3. CHECK PERMISSIONS FOR ANON ROLE
-- ==============================================

-- Check what permissions the anon role has
SELECT 'Anon Role Permissions:' as info;
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE grantee = 'anon'
AND table_name IN ('users', 'boxes')
AND table_schema = 'public';

-- ==============================================
-- 4. CHECK PERMISSIONS FOR AUTHENTICATED ROLE
-- ==============================================

-- Check what permissions the authenticated role has
SELECT 'Authenticated Role Permissions:' as info;
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated'
AND table_name IN ('users', 'boxes')
AND table_schema = 'public';

-- ==============================================
-- 5. TEST BOX INSERT (This is what should work)
-- ==============================================

-- Test if we can insert a box (this should work if user is authenticated)
SELECT 'Box Insert Test:' as info;
SELECT 
    'test-box' as description,
    250000.00 as price,
    'CA' as state,
    'Los Angeles' as city,
    'active' as status,
    (SELECT id FROM public.users WHERE supabase_id = auth.uid()) as user_id;
