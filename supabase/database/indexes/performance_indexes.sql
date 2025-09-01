-- Performance Indexes
-- This file contains only the essential indexes for optimal performance
-- Focused on the most common query patterns and critical performance paths

-- ========================================
-- CRITICAL PERFORMANCE INDEXES
-- ========================================

-- Credit transactions - ONLY the most essential indexes
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_user_created ON public.credit_transactions(user_id, created_at DESC);

-- Search history - Essential for user queries
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_user_created ON public.search_history(user_id, created_at DESC);
CREATE INDEX idx_search_history_session_id ON public.search_history(session_id) WHERE session_id IS NOT NULL;

-- Property cache - Essential for lookups
CREATE INDEX idx_property_cache_normalized_address ON public.property_data_cache(normalized_address);
CREATE INDEX idx_property_cache_expires_at ON public.property_data_cache(cache_expires_at);

-- User subscriptions - Essential for billing
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_active ON public.user_subscriptions(user_id, status) WHERE status = 'active';

-- Accounts - Essential for authentication
CREATE INDEX idx_accounts_email ON public.accounts(email);

-- ========================================
-- PARTIAL INDEXES FOR ACTIVE DATA ONLY
-- ========================================

-- Note: Removed partial indexes that used NOW() or other non-immutable functions
-- These would cause "functions in index predicate must be marked IMMUTABLE" errors

-- ========================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ========================================

-- User credit balance queries (most common)
CREATE INDEX idx_user_credits_user_balance ON public.user_credits(user_id, balance);

-- Credit transaction history with type filtering
CREATE INDEX idx_credit_transactions_user_type ON public.credit_transactions(user_id, type, created_at DESC);

-- Search history with type and tier filtering
CREATE INDEX idx_search_history_user_type_tier ON public.search_history(user_id, search_type, search_tier, created_at DESC);

-- ========================================
-- ANALYTICS INDEXES (ONLY IF NEEDED)
-- ========================================

-- Uncomment these ONLY if you're doing heavy analytics queries
-- CREATE INDEX idx_search_history_date_type ON public.search_history(created_at, search_type);
-- CREATE INDEX idx_credit_transactions_date_type ON public.credit_transactions(created_at, type);

-- ========================================
-- INDEX MAINTENANCE
-- ========================================

-- Function to analyze index usage and identify unused indexes
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE(
    index_name text,
    table_name text,
    index_size text,
    index_scans bigint,
    index_tuples_read bigint,
    index_tuples_fetched bigint
)
LANGUAGE sql
AS $$
    SELECT 
        i.indexname as index_name,
        t.tablename as table_name,
        pg_size_pretty(pg_relation_size(i.indexname::regclass)) as index_size,
        s.idx_scan as index_scans,
        s.idx_tup_read as index_tuples_read,
        s.idx_tup_fetch as index_tuples_fetched
    FROM pg_indexes i
    JOIN pg_stat_user_indexes s ON i.indexname = s.indexrelname
    JOIN pg_tables t ON i.tablename = t.tablename
    WHERE i.schemaname = 'public'
    ORDER BY s.idx_scan DESC;
$$;
