-- Add essential columns to pins table for simplified functionality
ALTER TABLE public.pins 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[], -- Array of image URLs
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing pins to have default values
UPDATE public.pins 
SET 
  name = 'Property Pin',
  notes = 'No notes available'
WHERE name IS NULL;

-- Make name required for new pins
ALTER TABLE public.pins ALTER COLUMN name SET NOT NULL;

-- Add index for name for better query performance
CREATE INDEX IF NOT EXISTS idx_pins_name ON public.pins(name);
