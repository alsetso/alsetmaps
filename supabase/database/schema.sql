-- Alset Property Matching Platform Database Schema
-- This file contains all tables, indexes, and constraints for the property matching system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ACCOUNTS TABLE
-- Tracks all users (buyers, sellers, admins)
CREATE TABLE accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('buyer', 'seller', 'admin')) DEFAULT 'buyer' NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. BUY_BOXES TABLE
-- What buyers are actively looking for right now
CREATE TABLE buy_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  title TEXT, -- optional (e.g. "Cash in Wright County under $350K")
  location TEXT, -- city/county/state
  price_min NUMERIC CHECK (price_min >= 0),
  price_max NUMERIC CHECK (price_max >= 0),
  bedrooms_min INTEGER CHECK (bedrooms_min >= 0),
  bathrooms_min INTEGER CHECK (bathrooms_min >= 0),
  property_type TEXT, -- e.g. 'single_family', 'duplex', 'condo', 'townhouse'
  terms TEXT[], -- e.g. ['cash', 'seller_finance', 'subto']
  notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Ensure price_max is greater than price_min when both are provided
  CONSTRAINT valid_price_range CHECK (
    price_min IS NULL OR price_max IS NULL OR price_max >= price_min
  )
);

-- 3. PROPERTIES_FOR_SALE TABLE
-- Off-market properties submitted by sellers
CREATE TABLE properties_for_sale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  lat NUMERIC CHECK (lat >= -90 AND lat <= 90),
  lng NUMERIC CHECK (lng >= -180 AND lng <= 180),
  price NUMERIC CHECK (price > 0) NOT NULL,
  bedrooms INTEGER CHECK (bedrooms >= 0),
  bathrooms NUMERIC CHECK (bathrooms >= 0), -- Allow half baths
  square_feet INTEGER CHECK (square_feet > 0),
  condition TEXT CHECK (condition IN ('needs_work', 'fair', 'good', 'excellent', 'turnkey')),
  terms_accepted TEXT[], -- e.g. ['cash', 'seller_finance', 'conventional']
  notes TEXT,
  status TEXT CHECK (status IN ('new', 'under_review', 'under_contract', 'sold')) DEFAULT 'new' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. CONTRACTS TABLE
-- Tracks deals under contract
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties_for_sale(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  contract_price NUMERIC CHECK (contract_price > 0) NOT NULL,
  contract_date DATE NOT NULL,
  close_date DATE,
  status TEXT CHECK (status IN ('pending', 'closed', 'cancelled')) DEFAULT 'pending' NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Ensure close_date is after contract_date when both are provided
  CONSTRAINT valid_date_range CHECK (
    close_date IS NULL OR close_date >= contract_date
  )
);

-- 5. LEAD_MATCHES TABLE
-- Connects buy boxes to listed properties and logs when a lead is matched or sold
CREATE TABLE lead_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_box_id UUID REFERENCES buy_boxes(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties_for_sale(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100) NOT NULL,
  lead_sold_to UUID REFERENCES accounts(id) ON DELETE SET NULL, -- buyer who bought the lead
  sold_price NUMERIC CHECK (sold_price >= 0),
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Ensure a property can only be matched to a buy_box once
  UNIQUE(buy_box_id, property_id)
);

-- INDEXES FOR PERFORMANCE
-- Accounts indexes
CREATE INDEX idx_accounts_role ON accounts(role);
CREATE INDEX idx_accounts_created_at ON accounts(created_at);

-- Buy boxes indexes
CREATE INDEX idx_buy_boxes_account_id ON buy_boxes(account_id);
CREATE INDEX idx_buy_boxes_is_active ON buy_boxes(is_active);
CREATE INDEX idx_buy_boxes_location ON buy_boxes(location);
CREATE INDEX idx_buy_boxes_price_range ON buy_boxes(price_min, price_max);
CREATE INDEX idx_buy_boxes_property_type ON buy_boxes(property_type);
CREATE INDEX idx_buy_boxes_created_at ON buy_boxes(created_at);

-- Properties for sale indexes
CREATE INDEX idx_properties_account_id ON properties_for_sale(account_id);
CREATE INDEX idx_properties_status ON properties_for_sale(status);
CREATE INDEX idx_properties_location ON properties_for_sale(city, state, zip);
CREATE INDEX idx_properties_price ON properties_for_sale(price);
CREATE INDEX idx_properties_bedrooms ON properties_for_sale(bedrooms);
CREATE INDEX idx_properties_bathrooms ON properties_for_sale(bathrooms);
CREATE INDEX idx_properties_condition ON properties_for_sale(condition);
CREATE INDEX idx_properties_created_at ON properties_for_sale(created_at);
CREATE INDEX idx_properties_coordinates ON properties_for_sale(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Contracts indexes
CREATE INDEX idx_contracts_property_id ON contracts(property_id);
CREATE INDEX idx_contracts_admin_id ON contracts(admin_id);
CREATE INDEX idx_contracts_buyer_id ON contracts(buyer_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_contract_date ON contracts(contract_date);
CREATE INDEX idx_contracts_close_date ON contracts(close_date);

-- Lead matches indexes
CREATE INDEX idx_lead_matches_buy_box_id ON lead_matches(buy_box_id);
CREATE INDEX idx_lead_matches_property_id ON lead_matches(property_id);
CREATE INDEX idx_lead_matches_lead_sold_to ON lead_matches(lead_sold_to);
CREATE INDEX idx_lead_matches_match_score ON lead_matches(match_score);
CREATE INDEX idx_lead_matches_created_at ON lead_matches(created_at);
CREATE INDEX idx_lead_matches_sold_at ON lead_matches(sold_at);

-- FUNCTIONS FOR AUTOMATIC UPDATED_AT TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- TRIGGERS FOR AUTOMATIC UPDATED_AT
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buy_boxes_updated_at BEFORE UPDATE ON buy_boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties_for_sale
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- VIEWS FOR COMMON QUERIES
-- Active buy boxes with account info
CREATE VIEW active_buy_boxes AS
SELECT 
    bb.*,
    a.full_name as buyer_name,
    a.phone as buyer_phone
FROM buy_boxes bb
JOIN accounts a ON bb.account_id = a.id
WHERE bb.is_active = true;

-- Properties with seller info
CREATE VIEW properties_with_seller AS
SELECT 
    p.*,
    a.full_name as seller_name,
    a.phone as seller_phone
FROM properties_for_sale p
JOIN accounts a ON p.account_id = a.id;

-- Contracts with all related info
CREATE VIEW contracts_with_details AS
SELECT 
    c.*,
    p.address,
    p.city,
    p.state,
    p.zip,
    p.price as asking_price,
    seller.full_name as seller_name,
    buyer.full_name as buyer_name,
    admin.full_name as admin_name
FROM contracts c
JOIN properties_for_sale p ON c.property_id = p.id
JOIN accounts seller ON p.account_id = seller.id
LEFT JOIN accounts buyer ON c.buyer_id = buyer.id
LEFT JOIN accounts admin ON c.admin_id = admin.id;

-- Lead matches with full details
CREATE VIEW lead_matches_with_details AS
SELECT 
    lm.*,
    bb.title as buy_box_title,
    bb.location as buy_box_location,
    bb.price_min,
    bb.price_max,
    p.address,
    p.city,
    p.state,
    p.zip,
    p.price as property_price,
    buyer.full_name as buyer_name,
    seller.full_name as seller_name
FROM lead_matches lm
JOIN buy_boxes bb ON lm.buy_box_id = bb.id
JOIN properties_for_sale p ON lm.property_id = p.id
JOIN accounts buyer ON bb.account_id = buyer.id
JOIN accounts seller ON p.account_id = seller.id;

-- COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE accounts IS 'User accounts with roles (buyer, seller, admin)';
COMMENT ON TABLE buy_boxes IS 'Buyer criteria and search parameters for property matching';
COMMENT ON TABLE properties_for_sale IS 'Off-market properties submitted by sellers';
COMMENT ON TABLE contracts IS 'Deals under contract managed by admins';
COMMENT ON TABLE lead_matches IS 'Matches between buy boxes and properties, tracks lead sales';

COMMENT ON COLUMN accounts.role IS 'User role: buyer, seller, or admin';
COMMENT ON COLUMN buy_boxes.terms IS 'Array of accepted financing terms';
COMMENT ON COLUMN properties_for_sale.terms_accepted IS 'Array of financing terms seller accepts';
COMMENT ON COLUMN lead_matches.match_score IS 'Numeric match score from 0-100';
COMMENT ON COLUMN lead_matches.lead_sold_to IS 'Buyer who purchased the lead (if sold)';
