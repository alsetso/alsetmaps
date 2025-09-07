-- Test User Flow Script
-- This script tests the complete user authentication and box operations flow

-- ==============================================
-- 1. CHECK CURRENT DATA
-- ==============================================

-- Check users table
SELECT 'Users Table:' as info;
SELECT id, name, email, supabase_id, created_at FROM public.users;

-- Check boxes table  
SELECT 'Boxes Table:' as info;
SELECT id, description, price, state, city, user_id, status, created_at FROM public.boxes;

-- ==============================================
-- 2. TEST AUTHENTICATION CONTEXT
-- ==============================================

-- Check current auth context (this will show the current user if authenticated)
SELECT 'Current Auth Context:' as info;
SELECT auth.uid() as current_user_id;

-- ==============================================
-- 3. TEST USER LOOKUP
-- ==============================================

-- Test finding user by supabase_id (this is what the frontend does)
SELECT 'User Lookup Test:' as info;
SELECT id, name, email, supabase_id 
FROM public.users 
WHERE supabase_id = auth.uid();

-- ==============================================
-- 4. TEST BOX OPERATIONS (as authenticated user)
-- ==============================================

-- Test SELECT boxes (this should work with RLS)
SELECT 'Boxes for Current User:' as info;
SELECT id, description, price, state, city, status, created_at 
FROM public.boxes 
WHERE user_id IN (
    SELECT id 
    FROM public.users 
    WHERE supabase_id = auth.uid()
);

-- ==============================================
-- 5. TEST INSERT OPERATION (simulate creating a box)
-- ==============================================

-- This would be the data structure for a new box
SELECT 'Test Box Data Structure:' as info;
SELECT 
    'test-description' as description,
    250000.00 as price,
    'CA' as state,
    'Los Angeles' as city,
    'active' as status,
    (SELECT id FROM public.users WHERE supabase_id = auth.uid()) as user_id;

-- ==============================================
-- 6. CHECK PERMISSIONS FOR CURRENT ROLE
-- ==============================================

-- Check what role we're running as
SELECT 'Current Role:' as info;
SELECT current_user, session_user;

-- Check permissions on tables
SELECT 'Table Permissions:' as info;
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE grantee = current_user
AND table_name IN ('users', 'boxes')
AND table_schema = 'public';
