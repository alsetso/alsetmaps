-- Database Tables
-- This file contains all CREATE TABLE statements for the database

-- ========================================
-- ACCOUNTS TABLE
-- ========================================
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

-- ========================================
-- CREDIT_PACKAGES TABLE
-- ========================================
CREATE TABLE public.credit_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(100) NOT NULL UNIQUE,
    credits integer NOT NULL CHECK (credits > 0),
    price_cents integer NOT NULL CHECK (price_cents >= 0),
    is_popular boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT NOW()
);

-- ========================================
-- USER_CREDITS TABLE (Simplified)
-- ========================================
CREATE TABLE public.user_credits (
    user_id uuid PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
    balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned integer NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
    total_spent integer NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    last_updated timestamp with time zone DEFAULT NOW()
);

-- ========================================
-- CREDIT_TRANSACTIONS TABLE (Simplified)
-- ========================================
CREATE TABLE public.credit_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    amount integer NOT NULL CHECK (amount != 0), -- positive for credits added, negative for consumed
    type character varying(50) NOT NULL CHECK (type IN ('purchase', 'subscription', 'search', 'refund', 'bonus', 'monthly_subscription')),
    reference_id uuid,
    reference_table character varying(100),
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT NOW()
);

-- ========================================
-- USER_SUBSCRIPTIONS TABLE
-- ========================================
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

-- ========================================
-- PROPERTY_DATA_CACHE TABLE
-- ========================================
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

-- ========================================
-- SEARCH_HISTORY TABLE
-- ========================================
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

-- ========================================
-- SEARCH_RESULTS TABLE
-- ========================================
CREATE TABLE public.search_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    search_history_id uuid NOT NULL REFERENCES public.search_history(id) ON DELETE CASCADE,
    result_data jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT NOW()
);

-- ========================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.accounts IS 'User account information and authentication details';
COMMENT ON TABLE public.credit_packages IS 'Available credit packages for purchase';
COMMENT ON TABLE public.user_credits IS 'Current credit balance and totals for each user';
COMMENT ON TABLE public.credit_transactions IS 'Complete audit trail of all credit movements';
COMMENT ON TABLE public.user_subscriptions IS 'User subscription plans and billing information';
COMMENT ON TABLE public.property_data_cache IS 'Cached property data to reduce API calls';
COMMENT ON TABLE public.search_history IS 'User search history and metadata';
COMMENT ON TABLE public.search_results IS 'Search results linked to search history';
