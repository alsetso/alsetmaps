-- Fix: Add SELECT policy to users table
-- This is required for the boxes policy to work because it queries the users table
CREATE POLICY "Users can view their own user record" ON "public"."users"
    FOR SELECT
    USING (supabase_id = auth.uid());

