-- Complete Alset Database Schema Migration
-- This migration creates the entire Alset property search platform

-- ========================================
-- CREATE TABLES
-- ========================================

-- Accounts table
CREATE TABLE public.accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(20),
    email character varying(255) UNIQUE NOT NULL,
    role character varying(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    stripe_customer_id character varying(255) UNIQUE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Credit packages table
CREATE TABLE public.credit_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(100) NOT NULL UNIQUE,
    credits integer NOT NULL CHECK (credits > 0),
    price_cents integer NOT NULL CHECK (price_cents >= 0),
    is_popular boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT NOW()
);

-- User credits table
CREATE TABLE public.user_credits (
    user_id uuid PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
    balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned integer NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
    total_spent integer NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    last_updated timestamp with time zone DEFAULT NOW()
);

-- Credit transactions table
CREATE TABLE public.credit_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    amount integer NOT NULL CHECK (amount != 0),
    type character varying(50) NOT NULL CHECK (type IN ('purchase', 'subscription', 'search', 'refund', 'bonus', 'monthly_subscription')),
    reference_id uuid,
    reference_table character varying(100),
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    stripe_subscription_id character varying(255) UNIQUE,
    plan_type character varying(50) NOT NULL CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
    status character varying(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start timestamp with time zone NOT NULL,
    current_period_end timestamp with time zone NOT NULL CHECK (current_period_end > current_period_start),
    credits_per_month integer NOT NULL CHECK (credits_per_month > 0),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Property data cache table
CREATE TABLE public.property_data_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    normalized_address character varying(500) UNIQUE NOT NULL,
    latitude numeric(10, 8) CHECK (latitude >= -90 AND latitude <= 90),
    longitude numeric(11, 8) CHECK (longitude >= -180 AND longitude <= 180),
    property_data jsonb NOT NULL,
    data_source character varying(100) NOT NULL,
    cache_expires_at timestamp with time zone NOT NULL,
    last_accessed timestamp with time zone DEFAULT NOW(),
    access_count integer DEFAULT 0 CHECK (access_count >= 0),
    created_at timestamp with time zone DEFAULT NOW()
);

-- Search history table
CREATE TABLE public.search_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
    session_id character varying(255),
    search_address character varying(500) NOT NULL,
    search_type character varying(50) NOT NULL DEFAULT 'basic' CHECK (search_type IN ('basic', 'advanced', 'comprehensive')),
    search_tier character varying(50) NOT NULL DEFAULT 'basic' CHECK (search_tier IN ('basic', 'smart', 'premium')),
    credits_consumed integer NOT NULL DEFAULT 0 CHECK (credits_consumed >= 0),
    search_filters jsonb DEFAULT '{}'::jsonb,
    search_metadata jsonb DEFAULT '{}'::jsonb,
    success boolean DEFAULT true,
    error_message text,
    created_at timestamp with time zone DEFAULT NOW()
);

-- Search results table
CREATE TABLE public.search_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    search_history_id uuid NOT NULL REFERENCES public.search_history(id) ON DELETE CASCADE,
    result_data jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT NOW()
);

-- ========================================
-- CREATE FUNCTIONS
-- ========================================

-- Handle new user trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO user_credits (user_id, balance, total_earned, total_spent)
    VALUES (NEW.id, 10, 10, 0);
    RETURN NEW;
END;
$$;

-- Update credit balance trigger function
CREATE OR REPLACE FUNCTION update_credit_balance_trigger()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_credits
        SET 
            balance = balance + NEW.amount,
            total_earned = total_earned + CASE WHEN NEW.amount > 0 THEN NEW.amount ELSE 0 END,
            total_spent = total_spent + CASE WHEN NEW.amount < 0 THEN ABS(NEW.amount) ELSE 0 END,
            last_updated = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add credits atomic function
CREATE OR REPLACE FUNCTION add_credits_atomic(
    user_uuid uuid,
    action_type_param character varying,
    credits_to_add integer,
    reference_id_param uuid DEFAULT NULL::uuid,
    reference_table_param character varying DEFAULT NULL::character varying,
    description_param text DEFAULT NULL::text,
    metadata_param jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
    success boolean,
    new_balance integer,
    transaction_id uuid,
    message character varying
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    current_balance integer;
    new_balance_val integer;
    transaction_id_val uuid;
    success_val boolean := false;
    message_val character varying;
BEGIN
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM user_credits
    WHERE user_id = user_uuid;
    
    IF current_balance IS NULL THEN
        INSERT INTO user_credits (user_id, balance, total_earned, total_spent)
        VALUES (user_uuid, 0, 0, 0);
        current_balance := 0;
    END IF;
    
    new_balance_val := current_balance + credits_to_add;
    transaction_id_val := gen_random_uuid();
    
    INSERT INTO credit_transactions (
        id, user_id, amount, type, reference_id, reference_table, description, metadata
    ) VALUES (
        transaction_id_val, user_uuid, credits_to_add, action_type_param, 
        reference_id_param, reference_table_param, description_param, metadata_param
    );
    
    success_val := true;
    message_val := 'Credits added successfully';
    
    RETURN QUERY SELECT success_val, new_balance_val, transaction_id_val, message_val;
    
EXCEPTION
    WHEN OTHERS THEN
        success_val := false;
        message_val := 'Error adding credits: ' || SQLERRM;
        RETURN QUERY SELECT success_val, 0, gen_random_uuid(), message_val;
END;
$$;

-- Consume credits atomic function
CREATE OR REPLACE FUNCTION consume_credits_atomic(
    user_uuid uuid,
    action_type_param character varying,
    credits_to_consume integer,
    reference_id_param uuid DEFAULT NULL::uuid,
    reference_table_param character varying DEFAULT NULL::character varying,
    description_param text DEFAULT NULL::text,
    metadata_param jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
    success boolean,
    remaining_credits integer,
    transaction_id uuid,
    message character varying
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    current_balance integer;
    remaining_credits_val integer;
    transaction_id_val uuid;
    success_val boolean := false;
    message_val character varying;
BEGIN
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM user_credits
    WHERE user_id = user_uuid;
    
    IF current_balance < credits_to_consume THEN
        success_val := false;
        message_val := 'Insufficient credits. Required: ' || credits_to_consume || ', Available: ' || current_balance;
        RETURN QUERY SELECT success_val, current_balance, gen_random_uuid(), message_val;
        RETURN;
    END IF;
    
    remaining_credits_val := current_balance - credits_to_consume;
    transaction_id_val := gen_random_uuid();
    
    INSERT INTO credit_transactions (
        id, user_id, amount, type, reference_id, reference_table, description, metadata
    ) VALUES (
        transaction_id_val, user_uuid, -credits_to_consume, action_type_param, 
        reference_id_param, reference_table_param, description_param, metadata_param
    );
    
    success_val := true;
    message_val := 'Credits consumed successfully';
    
    RETURN QUERY SELECT success_val, remaining_credits_val, transaction_id_val, message_val;
    
EXCEPTION
    WHEN OTHERS THEN
        success_val := false;
        message_val := 'Error consuming credits: ' || SQLERRM;
        RETURN QUERY SELECT success_val, 0, gen_random_uuid(), message_val;
END;
$$;

-- ========================================
-- CREATE TRIGGERS
-- ========================================

-- New user trigger
CREATE TRIGGER trigger_new_user
    AFTER INSERT ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Credit balance update trigger
CREATE TRIGGER trigger_credit_balance_update
    AFTER INSERT ON public.credit_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_balance_trigger();

-- ========================================
-- CREATE INDEXES
-- ========================================

-- Credit transactions indexes
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_user_created ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_credit_transactions_user_type ON public.credit_transactions(user_id, type, created_at DESC);

-- Search history indexes
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_user_created ON public.search_history(user_id, created_at DESC);
CREATE INDEX idx_search_history_session_id ON public.search_history(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_search_history_user_type_tier ON public.search_history(user_id, search_type, search_tier, created_at DESC);

-- Property cache indexes
CREATE INDEX idx_property_cache_normalized_address ON public.property_data_cache(normalized_address);
CREATE INDEX idx_property_cache_expires_at ON public.property_data_cache(cache_expires_at);
CREATE INDEX idx_property_cache_active ON public.property_data_cache(normalized_address) WHERE cache_expires_at > NOW();

-- User subscriptions indexes
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_active ON public.user_subscriptions(user_id, status) WHERE status = 'active';

-- Accounts indexes
CREATE INDEX idx_accounts_email ON public.accounts(email);

-- User credits indexes
CREATE INDEX idx_user_credits_user_balance ON public.user_credits(user_id, balance);

-- ========================================
-- ENABLE RLS
-- ========================================

ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE POLICIES
-- ========================================

-- Credit packages policies
CREATE POLICY "Authenticated users can view credit packages" ON public.credit_packages
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Credit transactions policies
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit transactions" ON public.credit_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Property cache policies
CREATE POLICY "Authenticated users can read property cache" ON public.property_data_cache
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Search history policies
CREATE POLICY "Users can insert own search history" ON public.search_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own search history" ON public.search_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Search results policies
CREATE POLICY "Users can view own search results" ON public.search_results
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM search_history sh 
            WHERE sh.id = search_results.search_history_id 
            AND sh.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own search results" ON public.search_results
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM search_history sh 
            WHERE sh.id = search_results.search_history_id 
            AND sh.user_id = auth.uid()
        )
    );

-- User credits policies
CREATE POLICY "Users can view own credits" ON public.user_credits
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.user_credits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Sample credit packages
INSERT INTO public.credit_packages (name, credits, price_cents, is_popular) VALUES 
('Starter Pack', 50, 999, false),
('Popular Pack', 100, 1799, true),
('Premium Pack', 250, 3999, false);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE public.accounts IS 'User account information and authentication details';
COMMENT ON TABLE public.credit_packages IS 'Available credit packages for purchase';
COMMENT ON TABLE public.user_credits IS 'Current credit balance and totals for each user';
COMMENT ON TABLE public.credit_transactions IS 'Complete audit trail of all credit movements';
COMMENT ON TABLE public.user_subscriptions IS 'User subscription plans and billing information';
COMMENT ON TABLE public.property_data_cache IS 'Cached property data to reduce API calls';
COMMENT ON TABLE public.search_history IS 'User search history and metadata';
COMMENT ON TABLE public.search_results IS 'Search results linked to search history';
