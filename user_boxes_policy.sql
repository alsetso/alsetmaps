-- Enable RLS on the boxes table
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own boxes
CREATE POLICY "Users can view their own boxes" ON public.boxes
    FOR SELECT
    USING (
        user_id IN (
            SELECT id 
            FROM public.users 
            WHERE supabase_id = auth.uid()
        )
    );

