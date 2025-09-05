-- Migration: Add auth_user_id to pins table for direct Supabase Auth relationship
-- This simplifies RLS policies and improves performance

-- Add auth_user_id column to pins table
ALTER TABLE pins 
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_pins_auth_user_id ON pins(auth_user_id);

-- Populate auth_user_id for existing pins
-- This joins through the accounts table to get the auth_user_id
UPDATE pins 
SET auth_user_id = accounts.auth_user_id
FROM accounts 
WHERE pins.user_id = accounts.id;

-- Make auth_user_id NOT NULL after populating
ALTER TABLE pins 
ALTER COLUMN auth_user_id SET NOT NULL;

-- Drop old complex RLS policies
DROP POLICY IF EXISTS "Allow all authenticated access" ON "public"."pins";
DROP POLICY IF EXISTS "Allow anonymous to view public pins" ON "public"."pins";
DROP POLICY IF EXISTS "Public pins are viewable by anyone" ON "public"."pins";
DROP POLICY IF EXISTS "Users can create their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can delete their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can update their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can view their own pins and public pins" ON "public"."pins";
DROP POLICY IF EXISTS "Authenticated users can access their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Comprehensive pins access policy" ON "public"."pins";

-- Create new simplified RLS policies using direct auth_user_id relationship

-- Allow all authenticated users to access all pins (for now - can be restricted later)
CREATE POLICY "Allow all authenticated access" ON "public"."pins"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous users to view public pins only
CREATE POLICY "Allow anonymous to view public pins" ON "public"."pins"
FOR SELECT
TO anon
USING (is_public = true);

-- Users can view their own pins and public pins (simplified with direct auth_user_id)
CREATE POLICY "Users can view own and public pins" ON "public"."pins"
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid() OR is_public = true);

-- Users can create pins (must set their own auth_user_id)
CREATE POLICY "Users can create own pins" ON "public"."pins"
FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid());

-- Users can update their own pins
CREATE POLICY "Users can update own pins" ON "public"."pins"
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Users can delete their own pins
CREATE POLICY "Users can delete own pins" ON "public"."pins"
FOR DELETE
TO authenticated
USING (auth_user_id = auth.uid());

-- Add comment explaining the dual relationship
COMMENT ON COLUMN pins.auth_user_id IS 'Direct reference to auth.users.id for simplified RLS policies and performance';
COMMENT ON COLUMN pins.user_id IS 'Reference to accounts.id for business logic, credits, and profile data';
