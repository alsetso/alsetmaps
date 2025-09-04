-- Create simplified intents table
CREATE TABLE public.intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  intent_type TEXT NOT NULL CHECK (intent_type IN ('buy', 'sell', 'refinance', 'loan')),
  
  -- Location: Either pin-specific OR city-level
  pin_id UUID REFERENCES public.pins(id) ON DELETE CASCADE,
  city TEXT,
  state TEXT,
  
  -- Simple criteria
  budget_min INTEGER,
  budget_max INTEGER,
  property_type TEXT,
  timeline TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: Must have either pin_id OR city/state
  CONSTRAINT location_constraint CHECK (
    (pin_id IS NOT NULL) OR (city IS NOT NULL AND state IS NOT NULL)
  )
);

-- Add RLS policies
ALTER TABLE public.intents ENABLE ROW LEVEL SECURITY;

-- Users can view their own intents
CREATE POLICY "Users can view own intents" ON public.intents
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own intents
CREATE POLICY "Users can insert own intents" ON public.intents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own intents
CREATE POLICY "Users can update own intents" ON public.intents
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can delete their own intents
CREATE POLICY "Users can delete own intents" ON public.intents
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create indexes for performance
CREATE INDEX idx_intents_user_id ON public.intents(user_id);
CREATE INDEX idx_intents_type ON public.intents(intent_type);
CREATE INDEX idx_intents_pin_id ON public.intents(pin_id);
CREATE INDEX idx_intents_city_state ON public.intents(city, state);
CREATE INDEX idx_intents_created_at ON public.intents(created_at);

-- Add comments
COMMENT ON TABLE public.intents IS 'Simplified intents table that links to pins or creates city-level intents';
COMMENT ON COLUMN public.intents.pin_id IS 'Links to specific property pin if user has searched that location';
COMMENT ON COLUMN public.intents.city IS 'City for city-level intent matching (when pin_id is null)';
COMMENT ON COLUMN public.intents.state IS 'State for city-level intent matching (when pin_id is null)';
COMMENT ON COLUMN public.intents.location_constraint IS 'Ensures either pin_id OR city/state is provided';
