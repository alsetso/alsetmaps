-- Upgrade pins table to include missing columns
-- This migration adds the required columns for the Create Property Pin form

-- Add missing columns to existing pins table
ALTER TABLE public.pins 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Property Pin',
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing pins to have a default name if they don't have one
UPDATE public.pins 
SET name = 'Property Pin' 
WHERE name IS NULL OR name = '';

-- Add constraints to ensure data integrity
ALTER TABLE public.pins 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN latitude SET NOT NULL,
ALTER COLUMN longitude SET NOT NULL;

-- Add check constraints for coordinate validation
ALTER TABLE public.pins 
ADD CONSTRAINT check_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
ADD CONSTRAINT check_longitude_range CHECK (longitude >= -180 AND longitude <= 180);

-- Add index for better performance on name searches
CREATE INDEX IF NOT EXISTS idx_pins_name ON public.pins(name);

-- Verify the updated table structure
COMMENT ON TABLE public.pins IS 'Enhanced pins table with full property information';
COMMENT ON COLUMN public.pins.name IS 'Property name/title for the pin';
COMMENT ON COLUMN public.pins.images IS 'Array of image URLs for the property';
COMMENT ON COLUMN public.pins.notes IS 'Additional notes about the property';
COMMENT ON COLUMN public.pins.latitude IS 'Property latitude (decimal degrees, -90 to 90)';
COMMENT ON COLUMN public.pins.longitude IS 'Property longitude (decimal degrees, -180 to 180)';
COMMENT ON COLUMN public.pins.search_history_id IS 'Reference to the search that created this pin';
