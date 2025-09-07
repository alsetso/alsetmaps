-- Quick update to fix HOA and price/budget columns
-- Run this if you already applied the migration before the latest changes

-- Drop the old price column and add budget_max
ALTER TABLE public.boxes 
DROP COLUMN IF EXISTS price;

ALTER TABLE public.boxes 
ADD COLUMN IF NOT EXISTS budget_max NUMERIC(12,2);

-- Update HOA preference to boolean
ALTER TABLE public.boxes 
DROP COLUMN IF EXISTS hoa_preference;

ALTER TABLE public.boxes 
ADD COLUMN IF NOT EXISTS hoa_ok BOOLEAN;

-- Add constraint for budget_max
ALTER TABLE public.boxes 
ADD CONSTRAINT IF NOT EXISTS valid_budget_max CHECK (budget_max >= 0);
