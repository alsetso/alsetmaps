-- Credits Table Schema
-- This table tracks user credits (both free and paid) for various services

CREATE TABLE public.credits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    credit_type text NOT NULL CHECK (credit_type IN ('free', 'paid')),
    service_type text NOT NULL CHECK (service_type IN ('property_search', 'agent_contact', 'marketplace_intent', 'other')),
    credits_available integer NOT NULL DEFAULT 0 CHECK (credits_available >= 0),
    credits_used integer NOT NULL DEFAULT 0 CHECK (credits_used >= 0),
    credits_total integer NOT NULL DEFAULT 0 CHECK (credits_total >= 0),
    stripe_subscription_id text,
    stripe_price_id text,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Indexes for credits table
CREATE INDEX idx_credits_user_id ON public.credits(user_id);
CREATE INDEX idx_credits_credit_type ON public.credits(credit_type);
CREATE INDEX idx_credits_service_type ON public.credits(service_type);
CREATE INDEX idx_credits_is_active ON public.credits(is_active);
CREATE INDEX idx_credits_expires_at ON public.credits(expires_at);
CREATE INDEX idx_credits_stripe_subscription_id ON public.credits(stripe_subscription_id);

-- Composite index for common queries
CREATE INDEX idx_credits_user_service_active ON public.credits(user_id, service_type, is_active);

-- Enable Row Level Security
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credits
CREATE POLICY "Users can view their own credits" ON public.credits
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own credits" ON public.credits
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own credits" ON public.credits
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own credits" ON public.credits
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_credits_updated_at 
    BEFORE UPDATE ON public.credits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate total available credits for a user and service
CREATE OR REPLACE FUNCTION get_user_available_credits(
    p_user_id uuid,
    p_service_type text DEFAULT 'property_search'
)
RETURNS TABLE(
    total_free_credits integer,
    total_paid_credits integer,
    total_available_credits integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN c.credit_type = 'free' THEN c.credits_available ELSE 0 END), 0) as total_free_credits,
        COALESCE(SUM(CASE WHEN c.credit_type = 'paid' THEN c.credits_available ELSE 0 END), 0) as total_paid_credits,
        COALESCE(SUM(c.credits_available), 0) as total_available_credits
    FROM public.credits c
    WHERE c.user_id = p_user_id 
        AND c.service_type = p_service_type 
        AND c.is_active = true
        AND (c.expires_at IS NULL OR c.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume credits (free credits first, then paid)
CREATE OR REPLACE FUNCTION consume_user_credits(
    p_user_id uuid,
    p_service_type text,
    p_credits_to_consume integer
)
RETURNS boolean AS $$
DECLARE
    v_free_credits integer;
    v_paid_credits integer;
    v_remaining_to_consume integer;
    v_credit_record record;
BEGIN
    -- Get available credits
    SELECT 
        COALESCE(SUM(CASE WHEN credit_type = 'free' THEN credits_available ELSE 0 END), 0) as free_credits,
        COALESCE(SUM(CASE WHEN credit_type = 'paid' THEN credits_available ELSE 0 END), 0) as paid_credits
    INTO v_free_credits, v_paid_credits
    FROM public.credits
    WHERE user_id = p_user_id 
        AND service_type = p_service_type 
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW());
    
    -- Check if user has enough credits
    IF (v_free_credits + v_paid_credits) < p_credits_to_consume THEN
        RETURN false;
    END IF;
    
    -- Consume free credits first
    v_remaining_to_consume := p_credits_to_consume;
    
    -- Update free credits
    IF v_free_credits > 0 THEN
        UPDATE public.credits 
        SET 
            credits_available = GREATEST(0, credits_available - LEAST(v_free_credits, v_remaining_to_consume)),
            credits_used = credits_used + LEAST(v_free_credits, v_remaining_to_consume)
        WHERE user_id = p_user_id 
            AND service_type = p_service_type 
            AND credit_type = 'free' 
            AND is_active = true
            AND (expires_at IS NULL OR expires_at > NOW());
        
        v_remaining_to_consume := GREATEST(0, v_remaining_to_consume - v_free_credits);
    END IF;
    
    -- Consume paid credits if needed
    IF v_remaining_to_consume > 0 AND v_paid_credits > 0 THEN
        UPDATE public.credits 
        SET 
            credits_available = GREATEST(0, credits_available - v_remaining_to_consume),
            credits_used = credits_used + v_remaining_to_consume
        WHERE user_id = p_user_id 
            AND service_type = p_service_type 
            AND credit_type = 'paid' 
            AND is_active = true
            AND (expires_at IS NULL OR expires_at > NOW());
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits to a user
CREATE OR REPLACE FUNCTION add_user_credits(
    p_user_id uuid,
    p_credit_type text,
    p_service_type text,
    p_credits_to_add integer,
    p_stripe_subscription_id text DEFAULT NULL,
    p_stripe_price_id text DEFAULT NULL,
    p_expires_at timestamp with time zone DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    v_credit_id uuid;
BEGIN
    -- Insert new credit record
    INSERT INTO public.credits (
        user_id,
        credit_type,
        service_type,
        credits_available,
        credits_total,
        stripe_subscription_id,
        stripe_price_id,
        expires_at
    ) VALUES (
        p_user_id,
        p_credit_type,
        p_service_type,
        p_credits_to_add,
        p_credits_to_add,
        p_stripe_subscription_id,
        p_stripe_price_id,
        p_expires_at
    ) RETURNING id INTO v_credit_id;
    
    RETURN v_credit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credits TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_available_credits TO authenticated;
GRANT EXECUTE ON FUNCTION consume_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_credits TO authenticated;
