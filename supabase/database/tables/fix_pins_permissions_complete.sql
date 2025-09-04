-- Complete fix for pins table permissions and RLS
-- This addresses all potential issues

-- 1. First, ensure the table has the right structure
ALTER TABLE public.pins 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Update existing pins with default values
UPDATE public.pins 
SET 
  name = COALESCE(name, 'Property Pin'),
  notes = COALESCE(notes, 'No notes available')
WHERE name IS NULL OR notes IS NULL;

-- 3. Make name required
ALTER TABLE public.pins ALTER COLUMN name SET NOT NULL;

-- 4. Drop all existing policies
DROP POLICY IF EXISTS "Users can view own pins" ON public.pins;
DROP POLICY IF EXISTS "Users can insert own pins" ON public.pins;
DROP POLICY IF EXISTS "Users can delete own pins" ON public.pins;
DROP POLICY IF EXISTS "Users can update own pins" ON public.pins;

-- 5. Ensure RLS is enabled
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

-- 6. Create working RLS policies
CREATE POLICY "Users can view own pins" ON public.pins 
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.accounts 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own pins" ON public.pins 
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.accounts 
      WHERE auth_user_id = auth.uid()
    )
  );

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

CREATE POLICY "Users can delete own pins" ON public.pins 
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM public.accounts 
      WHERE auth_user_id = auth.uid()
    )
  );

-- 7. Grant all necessary permissions
GRANT ALL ON public.pins TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pins_name ON public.pins(name);
CREATE INDEX IF NOT EXISTS idx_pins_user_id ON public.pins(user_id);
CREATE INDEX IF NOT EXISTS idx_pins_coordinates ON public.pins(latitude, longitude);

-- 9. Verify the setup
-- This will show you the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'pins';
