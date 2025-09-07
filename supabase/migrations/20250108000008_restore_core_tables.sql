-- Restore core database tables to match frontend expectations
-- This migration recreates the essential tables that were lost

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_id UUID UNIQUE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  population INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create boxes table (buy boxes)
CREATE TABLE IF NOT EXISTS boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  price_min NUMERIC,
  price_max NUMERIC,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  property_type TEXT,
  buyer_type TEXT CHECK (buyer_type IN ('first_time_buyer', 'investor', 'move_up_buyer', 'downsizer', 'other')),
  timeline TEXT CHECK (timeline IN ('asap', '1_3_months', '3_6_months', '6_12_months', 'flexible')),
  condition TEXT CHECK (condition IN ('any', 'needs_work', 'fair', 'good', 'excellent', 'turnkey')),
  occupant_intent TEXT CHECK (occupant_intent IN ('primary_residence', 'investment', 'vacation_home', 'other')),
  financing TEXT CHECK (financing IN ('cash', 'conventional', 'fha', 'va', 'usda', 'seller_finance', 'other')),
  notes TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'fulfilled')) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create listings table (sell listings)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  lat NUMERIC CHECK (lat >= -90 AND lat <= 90),
  lng NUMERIC CHECK (lng >= -180 AND lng <= 180),
  price NUMERIC CHECK (price > 0) NOT NULL,
  bedrooms INTEGER CHECK (bedrooms >= 0),
  bathrooms NUMERIC CHECK (bathrooms >= 0),
  square_feet INTEGER CHECK (square_feet > 0),
  condition TEXT CHECK (condition IN ('needs_work', 'fair', 'good', 'excellent', 'turnkey')),
  notes TEXT,
  status TEXT CHECK (status IN ('new', 'under_review', 'under_contract', 'sold')) DEFAULT 'new' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add foreign key constraint for listings city
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'listings_city_fkey'
    ) THEN
        ALTER TABLE listings ADD CONSTRAINT listings_city_fkey 
            FOREIGN KEY (city) REFERENCES cities(name) ON DELETE RESTRICT;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_coordinates ON cities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_boxes_user_id ON boxes(user_id);
CREATE INDEX IF NOT EXISTS idx_boxes_status ON boxes(status);
CREATE INDEX IF NOT EXISTS idx_boxes_city ON boxes(city);
CREATE INDEX IF NOT EXISTS idx_boxes_buyer_type ON boxes(buyer_type);
CREATE INDEX IF NOT EXISTS idx_boxes_property_type ON boxes(property_type);
CREATE INDEX IF NOT EXISTS idx_boxes_budget ON boxes(price_min, price_max);
CREATE INDEX IF NOT EXISTS idx_boxes_timeline ON boxes(timeline);
CREATE INDEX IF NOT EXISTS idx_boxes_condition ON boxes(condition);
CREATE INDEX IF NOT EXISTS idx_boxes_occupant_intent ON boxes(occupant_intent);
CREATE INDEX IF NOT EXISTS idx_boxes_financing ON boxes(financing);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(city, state, zip);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_bedrooms ON listings(bedrooms);
CREATE INDEX IF NOT EXISTS idx_listings_bathrooms ON listings(bathrooms);
CREATE INDEX IF NOT EXISTS idx_listings_condition ON listings(condition);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_coordinates ON listings(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at timestamps
DROP TRIGGER IF EXISTS update_boxes_updated_at ON boxes;
CREATE TRIGGER update_boxes_updated_at BEFORE UPDATE ON boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON boxes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON listings TO authenticated;
GRANT SELECT ON cities TO authenticated;

-- Create RLS policies for users
DROP POLICY IF EXISTS "Users can view their own user record" ON users;
DROP POLICY IF EXISTS "Users can insert their own user record" ON users;
DROP POLICY IF EXISTS "Users can update their own user record" ON users;

CREATE POLICY "Users can view their own user record" ON users
    FOR SELECT
    TO authenticated
    USING (supabase_id = auth.uid());

CREATE POLICY "Users can insert their own user record" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (supabase_id = auth.uid());

CREATE POLICY "Users can update their own user record" ON users
    FOR UPDATE
    TO authenticated
    USING (supabase_id = auth.uid())
    WITH CHECK (supabase_id = auth.uid());

-- Create RLS policies for boxes
DROP POLICY IF EXISTS "Users can view their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can insert their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can update their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can delete their own boxes" ON boxes;

CREATE POLICY "Users can view their own boxes" ON boxes
    FOR SELECT
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own boxes" ON boxes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own boxes" ON boxes
    FOR UPDATE
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own boxes" ON boxes
    FOR DELETE
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    );

-- Create RLS policies for listings
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

CREATE POLICY "Users can view their own listings" ON listings
    FOR SELECT
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own listings" ON listings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own listings" ON listings
    FOR UPDATE
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own listings" ON listings
    FOR DELETE
    TO authenticated
    USING (
        user_id IN (
            SELECT id 
            FROM users 
            WHERE supabase_id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts linked to Supabase auth';
COMMENT ON TABLE cities IS 'Minnesota cities with coordinates and population data';
COMMENT ON TABLE boxes IS 'Buy boxes - what buyers are looking for';
COMMENT ON TABLE listings IS 'Property listings - what sellers are offering';
