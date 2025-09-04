-- Drop existing complex RLS policies for credits table
DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
DROP POLICY IF EXISTS "Users can create own credits" ON public.credits;

-- Create simple RLS policies for credits table
-- Users can view their own credits
CREATE POLICY "Users can view own credits" ON public.credits 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = credits.user_id 
        AND accounts.auth_user_id = auth.uid()
    )
);

-- Users can insert their own credits
CREATE POLICY "Users can insert own credits" ON public.credits 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = credits.user_id 
        AND accounts.auth_user_id = auth.uid()
    )
);

-- Users can update their own credits
CREATE POLICY "Users can update own credits" ON public.credits 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = credits.user_id 
        AND accounts.auth_user_id = auth.uid()
    )
);

-- Users can delete their own credits
CREATE POLICY "Users can delete own credits" ON public.credits 
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = credits.user_id 
        AND accounts.auth_user_id = auth.uid()
    )
);

-- Grant DELETE permission on credits table
GRANT DELETE ON public.credits TO authenticated;
