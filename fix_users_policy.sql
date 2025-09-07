-- Fix: Add policy to allow users to read their own user record
-- This is needed because the boxes policy queries the users table
CREATE POLICY "Users can view their own user record" ON "public"."users"
    FOR SELECT
    USING (supabase_id = auth.uid());

