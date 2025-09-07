-- Fix permissions for boxes table
-- This grants the authenticated role permission to access the boxes table

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boxes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boxes TO anon;

-- Grant usage on the sequence (if using serial/identity)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Make sure RLS is disabled for now
ALTER TABLE public.boxes DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can manage their own boxes" ON public.boxes;

-- Verify permissions
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  hasrls
FROM pg_tables 
WHERE tablename = 'boxes';

-- Check table permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'boxes' 
AND table_schema = 'public';

