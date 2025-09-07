-- Add comprehensive fields to boxes table for better property matching
-- This migration adds all the additional fields requested for detailed buy box criteria

-- Create enums for structured data
CREATE TYPE buyer_type_enum AS ENUM (
  'first_time_buyer',
  'investor', 
  'move_up_buyer',
  'downsizing',
  'relocating'
);

CREATE TYPE property_type_enum AS ENUM (
  'single_family',
  'condo',
  'townhouse', 
  'duplex',
  'multi_family',
  'land',
  'commercial'
);

CREATE TYPE timeline_enum AS ENUM (
  'asap',
  '1_month',
  '3_months',
  '6_months',
  '1_year',
  'flexible'
);

CREATE TYPE condition_enum AS ENUM (
  'turnkey',
  'good',
  'fair', 
  'needs_work',
  'any'
);

CREATE TYPE occupant_intent_enum AS ENUM (
  'primary_residence',
  'investment',
  'vacation_home',
  'rental',
  'flip'
);

CREATE TYPE financing_enum AS ENUM (
  'cash',
  'conventional',
  'fha',
  'va',
  'seller_finance',
  'hard_money',
  'flexible'
);

-- Drop the old price column and add new comprehensive columns
ALTER TABLE public.boxes 
DROP COLUMN IF EXISTS price, -- Remove old price column
ADD COLUMN IF NOT EXISTS buyer_type buyer_type_enum,
ADD COLUMN IF NOT EXISTS budget_max NUMERIC(12,2), -- Maximum budget
ADD COLUMN IF NOT EXISTS property_type property_type_enum,
ADD COLUMN IF NOT EXISTS timeline_to_close timeline_enum,
ADD COLUMN IF NOT EXISTS preferred_condition condition_enum,
ADD COLUMN IF NOT EXISTS occupant_intent occupant_intent_enum,
ADD COLUMN IF NOT EXISTS hoa_ok BOOLEAN, -- Boolean: true = HOA ok, false = no HOA preferred
ADD COLUMN IF NOT EXISTS lot_size INTEGER, -- Lot size in square feet
ADD COLUMN IF NOT EXISTS year_built INTEGER, -- Year built
ADD COLUMN IF NOT EXISTS financing_details financing_enum,
ADD COLUMN IF NOT EXISTS deal_breakers TEXT, -- Text field for deal breakers
ADD COLUMN IF NOT EXISTS seller_flexibility TEXT, -- e.g., 'flexible', 'some_flexibility', 'strict_timeline'
ADD COLUMN IF NOT EXISTS notes TEXT; -- Additional notes and preferences

-- Add constraints for data validation
ALTER TABLE public.boxes 
ADD CONSTRAINT valid_budget_max CHECK (budget_max >= 0),
ADD CONSTRAINT valid_lot_size CHECK (lot_size >= 0),
ADD CONSTRAINT valid_year_built CHECK (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM NOW()) + 2);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_boxes_buyer_type ON public.boxes(buyer_type);
CREATE INDEX IF NOT EXISTS idx_boxes_property_type ON public.boxes(property_type);
CREATE INDEX IF NOT EXISTS idx_boxes_budget ON public.boxes(budget_max);
CREATE INDEX IF NOT EXISTS idx_boxes_timeline ON public.boxes(timeline_to_close);
CREATE INDEX IF NOT EXISTS idx_boxes_condition ON public.boxes(preferred_condition);
CREATE INDEX IF NOT EXISTS idx_boxes_occupant_intent ON public.boxes(occupant_intent);
CREATE INDEX IF NOT EXISTS idx_boxes_financing ON public.boxes(financing_details);

-- Update the updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_boxes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_boxes_updated_at ON public.boxes;
CREATE TRIGGER update_boxes_updated_at
  BEFORE UPDATE ON public.boxes
  FOR EACH ROW
  EXECUTE FUNCTION update_boxes_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN public.boxes.buyer_type IS 'Type of buyer: first_time_buyer, investor, move_up_buyer, downsizing, relocating';
COMMENT ON COLUMN public.boxes.budget_max IS 'Maximum budget in dollars';
COMMENT ON COLUMN public.boxes.property_type IS 'Type of property: single_family, condo, townhouse, duplex, multi_family, land, commercial';
COMMENT ON COLUMN public.boxes.timeline_to_close IS 'Timeline preference: asap, 1_month, 3_months, 6_months, 1_year, flexible';
COMMENT ON COLUMN public.boxes.preferred_condition IS 'Property condition preference: turnkey, good, fair, needs_work, any';
COMMENT ON COLUMN public.boxes.occupant_intent IS 'Intended use: primary_residence, investment, vacation_home, rental, flip';
COMMENT ON COLUMN public.boxes.hoa_ok IS 'HOA preference: true = HOA ok, false = no HOA preferred';
COMMENT ON COLUMN public.boxes.lot_size IS 'Lot size in square feet';
COMMENT ON COLUMN public.boxes.year_built IS 'Year built';
COMMENT ON COLUMN public.boxes.financing_details IS 'Financing method: cash, conventional, fha, va, seller_finance, hard_money, flexible';
COMMENT ON COLUMN public.boxes.deal_breakers IS 'Text field for deal breakers and must-haves';
COMMENT ON COLUMN public.boxes.seller_flexibility IS 'Seller flexibility: flexible, some_flexibility, strict_timeline';
COMMENT ON COLUMN public.boxes.notes IS 'Additional notes and preferences';
