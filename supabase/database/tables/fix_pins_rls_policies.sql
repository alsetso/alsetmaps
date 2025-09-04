-- Fix RLS policies for pins table to allow proper insert permissions
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own pins" ON public.pins;
DROP POLICY IF EXISTS "Users can insert own pins" ON public.pins;
DROP POLICY IF EXISTS "Users can delete own pins" ON public.pins;

-- Create corrected RLS policies
-- Users can view pins where they are the owner (via accounts table)
CREATE POLICY "Users can view own pins" ON public.pins 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = pins.user_id 
      AND accounts.auth_user_id::text = auth.uid()::text
    )
  );

-- Users can insert pins for themselves (via accounts table)
CREATE POLICY "Users can insert own pins" ON public.pins 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = pins.user_id 
      AND accounts.auth_user_id::text = auth.uid()::text
    )
  );

-- Users can delete pins where they are the owner (via accounts table)
CREATE POLICY "Users can delete own pins" ON public.pins 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = pins.user_id 
      AND accounts.auth_user_id::text = auth.uid()::text
    )
  );

-- Users can update pins where they are the owner (via accounts table)
CREATE POLICY "Users can update own pins" ON public.pins 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = pins.user_id 
      AND accounts.auth_user_id::text = auth.uid()::text
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = pins.user_id 
      AND accounts.auth_user_id::text = auth.uid()::text
    )
  );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pins TO authenticated;
