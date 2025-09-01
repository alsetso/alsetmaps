-- Database Functions
-- This file contains all database functions for the Alset application

-- =====================================================
-- CREDIT SYSTEM FUNCTIONS
-- =====================================================

-- Function: add_credits_atomic
-- Purpose: Atomically add credits to a user's account
-- Security: Definer
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
    -- Get current balance
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM user_credits
    WHERE user_id = user_uuid;
    
    -- If no record exists, create one
    IF current_balance IS NULL THEN
        INSERT INTO user_credits (user_id, balance, total_earned, total_spent)
        VALUES (user_uuid, 0, 0, 0);
        current_balance := 0;
    END IF;
    
    -- Calculate new balance
    new_balance_val := current_balance + credits_to_add;
    
    -- Generate transaction ID
    transaction_id_val := gen_random_uuid();
    
    -- Update credits balance
    UPDATE user_credits
    SET balance = new_balance_val,
        total_earned = total_earned + credits_to_add,
        last_updated = NOW()
    WHERE user_id = user_uuid;
    
    -- Log the transaction
    INSERT INTO credit_transactions (
        id,
        user_id,
        amount,
        type,
        reference_id,
        reference_table,
        description,
        metadata
    ) VALUES (
        transaction_id_val,
        user_uuid,
        credits_to_add,
        action_type_param,
        reference_id_param,
        reference_table_param,
        description_param,
        metadata_param
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

-- Function: consume_credits_atomic
-- Purpose: Atomically consume credits from a user's account
-- Security: Definer
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
    -- Get current balance
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM user_credits
    WHERE user_id = user_uuid;
    
    -- Check if user has enough credits
    IF current_balance < credits_to_consume THEN
        success_val := false;
        message_val := 'Insufficient credits. Required: ' || credits_to_consume || ', Available: ' || current_balance;
        RETURN QUERY SELECT success_val, current_balance, gen_random_uuid(), message_val;
        RETURN;
    END IF;
    
    -- Calculate remaining balance
    remaining_credits_val := current_balance - credits_to_consume;
    
    -- Generate transaction ID
    transaction_id_val := gen_random_uuid();
    
    -- Update credits balance
    UPDATE user_credits
    SET balance = remaining_credits_val,
        total_spent = total_spent + credits_to_consume,
        last_updated = NOW()
    WHERE user_id = user_uuid;
    
    -- Log the transaction
    INSERT INTO credit_transactions (
        id,
        user_id,
        amount,
        type,
        reference_id,
        reference_table,
        description,
        metadata
    ) VALUES (
        transaction_id_val,
        user_uuid,
        -credits_to_consume,
        action_type_param,
        reference_id_param,
        reference_table_param,
        description_param,
        metadata_param
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

-- Function: purchase_credits
-- Purpose: Handle credit purchase transactions
-- Security: Invoker
CREATE OR REPLACE FUNCTION purchase_credits(
    user_uuid uuid,
    package_id uuid,
    stripe_payment_intent_id character varying
)
RETURNS TABLE(
    success boolean,
    credits_added integer,
    new_balance integer,
    message character varying
)
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    credits_amount integer;
    package_price integer;
    success_val boolean := false;
    credits_added_val integer;
    new_balance_val integer;
    message_val character varying;
BEGIN
    -- Get credits amount and price from package
    SELECT credits, price_cents INTO credits_amount, package_price
    FROM credit_packages
    WHERE id = package_id;
    
    IF credits_amount IS NULL THEN
        message_val := 'Invalid package ID';
        RETURN QUERY SELECT success_val, 0, 0, message_val;
        RETURN;
    END IF;
    
    -- Add credits using atomic function
    SELECT 
        success,
        new_balance,
        transaction_id,
        message
    INTO 
        success_val,
        new_balance_val,
        transaction_id_val,
        message_val
    FROM add_credits_atomic(
        user_uuid,
        'purchase',
        credits_amount,
        package_id,
        'credit_packages',
        'Credit package purchase',
        jsonb_build_object('stripe_payment_intent_id', stripe_payment_intent_id, 'package_price_cents', package_price)
    );
    
    IF success_val THEN
        credits_added_val := credits_amount;
    ELSE
        credits_added_val := 0;
        new_balance_val := 0;
    END IF;
    
    RETURN QUERY SELECT success_val, credits_added_val, new_balance_val, message_val;
    
EXCEPTION
    WHEN OTHERS THEN
        success_val := false;
        message_val := 'Error processing purchase: ' || SQLERRM;
        RETURN QUERY SELECT success_val, 0, 0, message_val;
END;
$$;

-- Function: refresh_monthly_credits
-- Purpose: Refresh monthly credits for all users with active subscriptions
-- Security: Invoker
CREATE OR REPLACE FUNCTION refresh_monthly_credits()
RETURNS void
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update users who are eligible for monthly credit refresh
    UPDATE user_credits
    SET balance = balance + us.credits_per_month,
        total_earned = total_earned + us.credits_per_month,
        last_updated = NOW()
    FROM user_subscriptions us
    WHERE user_credits.user_id = us.user_id
    AND us.status = 'active'
    AND us.current_period_end <= NOW();
    
    -- Log the monthly credit additions
    INSERT INTO credit_transactions (user_id, amount, type, description, metadata)
    SELECT 
        us.user_id,
        us.credits_per_month,
        'monthly_subscription',
        'Monthly subscription credits',
        jsonb_build_object('subscription_id', us.id, 'period_end', us.current_period_end)
    FROM user_subscriptions us
    WHERE us.status = 'active'
    AND us.current_period_end <= NOW();
END;
$$;

-- =====================================================
-- PROPERTY SEARCH FUNCTIONS
-- =====================================================

-- Function: get_cached_property_data
-- Purpose: Retrieve cached property data or indicate if refresh is needed
-- Security: Definer
CREATE OR REPLACE FUNCTION get_cached_property_data(
    address_param character varying
)
RETURNS TABLE(
    cache_id uuid,
    property_data jsonb,
    is_cached boolean,
    needs_refresh boolean
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    cache_record record;
    cache_age interval;
    max_cache_age interval := interval '24 hours';
BEGIN
    -- Look for cached data
    SELECT 
        id,
        property_data,
        created_at,
        last_accessed
    INTO cache_record
    FROM property_data_cache
    WHERE normalized_address = lower(trim(address_param))
    AND cache_expires_at > NOW();
    
    IF cache_record.id IS NULL THEN
        -- No cache found
        RETURN QUERY SELECT 
            gen_random_uuid(),
            '{}'::jsonb,
            false,
            true;
        RETURN;
    END IF;
    
    -- Check cache age
    cache_age := NOW() - cache_record.created_at;
    
    -- Update last accessed timestamp
    UPDATE property_data_cache
    SET last_accessed = NOW(),
        access_count = access_count + 1
    WHERE id = cache_record.id;
    
    -- Determine if refresh is needed
    IF cache_age > max_cache_age THEN
        RETURN QUERY SELECT 
            cache_record.id,
            cache_record.property_data,
            true,
            true;
    ELSE
        RETURN QUERY SELECT 
            cache_record.id,
            cache_record.property_data,
            true,
            false;
    END IF;
END;
$$;

-- Function: get_user_search_history
-- Purpose: Retrieve user's search history with optional filtering
-- Security: Definer
CREATE OR REPLACE FUNCTION get_user_search_history(
    user_uuid uuid DEFAULT NULL::uuid,
    session_id_param character varying DEFAULT NULL::character varying,
    limit_count integer DEFAULT 50,
    offset_count integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    search_address character varying,
    search_type character varying,
    search_tier character varying,
    credits_consumed integer,
    search_filters jsonb,
    success boolean,
    error_message text,
    created_at timestamp with time zone
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.id,
        sh.search_address,
        sh.search_type,
        sh.search_tier,
        sh.credits_consumed,
        sh.search_filters,
        sh.success,
        sh.error_message,
        sh.created_at
    FROM search_history sh
    WHERE (user_uuid IS NOT NULL AND sh.user_id = user_uuid)
       OR (session_id_param IS NOT NULL AND sh.session_id = session_id_param)
    ORDER BY sh.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Function: update_search_success
-- Purpose: Update search success status and error information
-- Security: Definer
CREATE OR REPLACE FUNCTION update_search_success(
    search_history_id uuid,
    success boolean,
    error_msg character varying DEFAULT NULL::character varying
)
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE search_history
    SET 
        success = update_search_success.success,
        error_message = update_search_success.error_msg
    WHERE id = search_history_id;
    
    -- Refresh analytics views
    PERFORM refresh_analytics_views();
END;
$$;

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Function: handle_new_user
-- Purpose: Handle new user creation
-- Security: Definer
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create user credits record
    INSERT INTO user_credits (
        user_id,
        balance,
        total_earned,
        total_spent
    ) VALUES (
        NEW.id,
        10, -- Welcome bonus credits
        10, -- Welcome bonus
        0
    );
    
    RETURN NEW;
END;
$$;

-- Function: update_credit_balance_trigger
-- Purpose: Update credit balance when transactions change
-- Security: Definer
CREATE OR REPLACE FUNCTION update_credit_balance_trigger()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update user credits balance based on transaction
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

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user creation
CREATE TRIGGER trigger_new_user
    AFTER INSERT ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger for credit balance updates
CREATE TRIGGER trigger_credit_balance_update
    AFTER INSERT ON public.credit_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_balance_trigger();
