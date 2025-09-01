-- Database Policies for Alset System
-- This file contains optimized Row Level Security (RLS) policies
-- Focused on security, performance, and maintainability

-- ========================================
-- ACCOUNTS TABLE POLICIES
-- ========================================
-- Enable RLS for accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Users can view own account
CREATE POLICY "Users can view own account" ON public.accounts
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update own account
CREATE POLICY "Users can update own account" ON public.accounts
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own account
CREATE POLICY "Users can insert own account" ON public.accounts
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ========================================
-- CREDIT_PACKAGES TABLE POLICIES
-- ========================================
-- Enable RLS for credit_packages table
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view credit packages
CREATE POLICY "Authenticated users can view credit packages" ON public.credit_packages
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ========================================
-- CREDIT_TRANSACTIONS TABLE POLICIES
-- ========================================
-- Enable RLS for credit_transactions table
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view own credit transactions
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own credit transactions
CREATE POLICY "Users can insert own credit transactions" ON public.credit_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- PROPERTY_DATA_CACHE TABLE POLICIES
-- ========================================
-- Enable RLS for property_data_cache table
ALTER TABLE public.property_data_cache ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read property cache
CREATE POLICY "Authenticated users can read property cache" ON public.property_data_cache
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ========================================
-- SEARCH_HISTORY TABLE POLICIES
-- ========================================
-- Enable RLS for search_history table
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Users can insert own search history
CREATE POLICY "Users can insert own search history" ON public.search_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view own search history
CREATE POLICY "Users can view own search history" ON public.search_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- ========================================
-- SEARCH_RESULTS TABLE POLICIES
-- ========================================
-- Enable RLS for search_results table
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;

-- Users can view search results for their own searches
CREATE POLICY "Users can view own search results" ON public.search_results
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM search_history sh 
            WHERE sh.id = search_results.search_history_id 
            AND sh.user_id = auth.uid()
        )
    );

-- Users can insert search results for their own searches
CREATE POLICY "Users can insert own search results" ON public.search_results
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM search_history sh 
            WHERE sh.id = search_results.search_history_id 
            AND sh.user_id = auth.uid()
        )
    );

-- ========================================
-- USER_CREDITS TABLE POLICIES
-- ========================================
-- Enable RLS for user_credits table
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can view own credits
CREATE POLICY "Users can view own credits" ON public.user_credits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own credits
CREATE POLICY "Users can update own credits" ON public.user_credits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ========================================
-- USER_SUBSCRIPTIONS TABLE POLICIES
-- ========================================
-- Enable RLS for user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ========================================
-- ANALYTICS VIEWS (No RLS needed)
-- ========================================
-- Note: Materialized views like search_analytics_daily inherit permissions
-- from their underlying tables (search_history, credit_transactions, etc.)
-- No additional policies needed here
