-- Complete RLS and Permissions Fix for Users and Boxes Tables
-- This script ensures proper permissions and RLS policies are in place

-- ==============================================
-- 1. GRANT PERMISSIONS TO ROLES
-- ==============================================

-- Grant permissions on users table
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Grant permissions on boxes table  
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boxes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boxes TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ==============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 3. DROP EXISTING POLICIES (CLEAN SLATE)
-- ==============================================

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Users can view their own user record" ON public.users;
DROP POLICY IF EXISTS "Users can view their own boxes" ON public.boxes;
DROP POLICY IF EXISTS "Enable users to insert their own boxes" ON public.boxes;
DROP POLICY IF EXISTS "Enable users to update their own boxes" ON public.boxes;
DROP POLICY IF EXISTS "Enable users to delete their own boxes" ON public.boxes;

-- ==============================================
-- 4. CREATE COMPREHENSIVE RLS POLICIES
-- ==============================================

-- Users table policies
CREATE POLICY "Users can view their own user record" ON public.users
    FOR SELECT
    TO authenticated
    USING (supabase_id = auth.uid());

-- Boxes table policies
CREATE POLICY "Users can view their own boxes" ON public.boxes
    FOR SELECT
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM public.users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own boxes" ON public.boxes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id IN (
            SELECT id 
            FROM public.users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own boxes" ON public.boxes
    FOR UPDATE
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM public.users 
            WHERE supabase_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id IN (
            SELECT id 
            FROM public.users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own boxes" ON public.boxes
    FOR DELETE
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM public.users 
            WHERE supabase_id = auth.uid()
        )
    );

-- ==============================================
-- 5. VERIFICATION QUERIES
-- ==============================================

-- Check RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'boxes')
AND schemaname = 'public';

-- Check table permissions
SELECT 
    table_name,
    grantee, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_name IN ('users', 'boxes')
AND table_schema = 'public'
ORDER BY table_name, grantee, privilege_type;

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'boxes')
AND schemaname = 'public'
ORDER BY tablename, policyname;
