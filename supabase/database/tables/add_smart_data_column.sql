-- Add smart_data column to search_history table
-- This column will store the JSON response from the Zillow API for smart searches

ALTER TABLE public.search_history 
ADD COLUMN smart_data JSONB;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.search_history.smart_data IS 'Stores the full API response data from Zillow for smart searches. NULL for basic searches.';

-- Create an index on the smart_data column for better query performance
CREATE INDEX idx_search_history_smart_data ON public.search_history USING GIN (smart_data);

-- Update the RLS policy to allow users to view their own smart_data
-- (The existing SELECT policy should already cover this, but let's make sure)
-- Note: The existing policy should work: "SELECT ON public.search_history FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM public.accounts WHERE id = user_id))"
