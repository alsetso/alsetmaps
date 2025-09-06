-- Fix RLS policies for pins table to resolve authentication issues
-- This creates a simple permissive policy for development

-- Step 1: Drop ALL existing conflicting policies
DROP POLICY IF EXISTS "Allow anonymous to view public pins" ON "public"."pins";
DROP POLICY IF EXISTS "Anonymous can view public for-sale pins" ON "public"."pins";
DROP POLICY IF EXISTS "Authenticated can view public for-sale pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can create their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can delete their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can update their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can view own and public pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can view their own pins" ON "public"."pins";

-- Step 2: Create simple, working RLS policies
-- Allow all authenticated users to do everything (temporary fix for development)
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

-- Add comment explaining the temporary policy
COMMENT ON TABLE public.pins IS 'Pins table uses temporary permissive RLS policy for development - all authenticated users can access all pins';
