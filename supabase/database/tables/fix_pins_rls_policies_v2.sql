-- Fix RLS policies for pins table - Simplified approach
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own pins" ON public.pins;
DROP POLICY IF EXISTS "Users can insert own pins" ON public.pins;
DROP POLICY IF EXISTS "Users can delete own pins" ON public.pins;
DROP POLICY IF EXISTS "Users can update own pins" ON public.pins;

-- Create simplified RLS policies that work correctly
-- Users can view pins where they are the owner
CREATE POLICY "Users can view own pins" ON public.pins 
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.accounts 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can insert pins for themselves
CREATE POLICY "Users can insert own pins" ON public.pins 
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.accounts 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update pins where they are the owner
CREATE POLICY "Users can update own pins" ON public.pins 
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM public.accounts 
      WHERE auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM public.accounts 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can delete pins where they are the owner
CREATE POLICY "Users can delete own pins" ON public.pins 
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM public.accounts 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Ensure proper permissions are granted
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pins TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
