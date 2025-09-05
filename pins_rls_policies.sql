-- Drop all existing policies on pins table
DROP POLICY IF EXISTS "Allow all authenticated access" ON "public"."pins";
DROP POLICY IF EXISTS "Allow anonymous to view public pins" ON "public"."pins";
DROP POLICY IF EXISTS "Public pins are viewable by anyone" ON "public"."pins";
DROP POLICY IF EXISTS "Users can create their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can delete their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can update their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Users can view their own pins and public pins" ON "public"."pins";
DROP POLICY IF EXISTS "Authenticated users can access their own pins" ON "public"."pins";
DROP POLICY IF EXISTS "Comprehensive pins access policy" ON "public"."pins";

-- Create new policies

-- Allow all authenticated access (ALL operations)
CREATE POLICY "Allow all authenticated access" ON "public"."pins"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous to view public pins (SELECT only)
CREATE POLICY "Allow anonymous to view public pins" ON "public"."pins"
FOR SELECT
TO anon
USING (is_public = true);

-- Public pins are viewable by anyone (SELECT for both anon and authenticated)
CREATE POLICY "Public pins are viewable by anyone" ON "public"."pins"
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- Users can create their own pins (INSERT)
CREATE POLICY "Users can create their own pins" ON "public"."pins"
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT accounts.id 
    FROM accounts 
    WHERE accounts.auth_user_id = auth.uid()
  )
);

-- Users can delete their own pins (DELETE)
CREATE POLICY "Users can delete their own pins" ON "public"."pins"
FOR DELETE
TO authenticated
USING (
  user_id IN (
    SELECT accounts.id 
    FROM accounts 
    WHERE accounts.auth_user_id = auth.uid()
  )
);

-- Users can update their own pins (UPDATE)
CREATE POLICY "Users can update their own pins" ON "public"."pins"
FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT accounts.id 
    FROM accounts 
    WHERE accounts.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  user_id IN (
    SELECT accounts.id 
    FROM accounts 
    WHERE accounts.auth_user_id = auth.uid()
  )
);

-- Users can view their own pins and public pins (SELECT)
CREATE POLICY "Users can view their own pins and public pins" ON "public"."pins"
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT accounts.id 
    FROM accounts 
    WHERE accounts.auth_user_id = auth.uid()
  ) OR is_public = true
);
