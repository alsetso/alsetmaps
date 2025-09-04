-- Create simplified pins table
CREATE TABLE public.pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  search_history_id UUID REFERENCES public.search_history(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

-- Users can view their own pins
CREATE POLICY "Users can view own pins" ON public.pins 
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert own pins
CREATE POLICY "Users can insert own pins" ON public.pins 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own pins
CREATE POLICY "Users can delete own pins" ON public.pins 
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Add indexes for better performance
CREATE INDEX idx_pins_user_id ON public.pins(user_id);
CREATE INDEX idx_pins_search_history_id ON public.pins(search_history_id);
CREATE INDEX idx_pins_coordinates ON public.pins(latitude, longitude);
