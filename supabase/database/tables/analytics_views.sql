-- Analytics Views
-- This file contains materialized views for analytics instead of storing computed data

-- ========================================
-- DAILY SEARCH ANALYTICS VIEW
-- ========================================
CREATE MATERIALIZED VIEW public.search_analytics_daily AS
SELECT 
    date_trunc('day', sh.created_at) as date,
    COUNT(*) as total_searches,
    COUNT(*) FILTER (WHERE sh.user_id IS NOT NULL) as authenticated_searches,
    COUNT(*) FILTER (WHERE sh.user_id IS NULL) as anonymous_searches,
    COUNT(*) FILTER (WHERE sh.search_tier = 'basic') as basic_searches,
    COUNT(*) FILTER (WHERE sh.search_tier = 'smart') as smart_searches,
    SUM(sh.credits_consumed) as total_credits_consumed,
    COUNT(*) FILTER (WHERE sh.success = true) as successful_searches,
    COUNT(*) FILTER (WHERE sh.success = false) as failed_searches,
    NOW() as last_updated
FROM public.search_history sh
GROUP BY date_trunc('day', sh.created_at)
ORDER BY date DESC;

-- ========================================
-- USER CREDIT SUMMARY VIEW
-- ========================================
CREATE MATERIALIZED VIEW public.user_credit_summary AS
SELECT 
    uc.user_id,
    a.email,
    a.first_name,
    a.last_name,
    uc.balance as current_balance,
    uc.total_earned,
    uc.total_spent,
    us.plan_type,
    us.status as subscription_status,
    us.credits_per_month,
    uc.last_updated
FROM public.user_credits uc
JOIN public.accounts a ON uc.user_id = a.id
LEFT JOIN public.user_subscriptions us ON uc.user_id = us.user_id AND us.status = 'active'
ORDER BY uc.balance DESC;

-- ========================================
-- PROPERTY CACHE STATS VIEW
-- ========================================
CREATE MATERIALIZED VIEW public.property_cache_stats AS
SELECT 
    data_source,
    COUNT(*) as total_cached_properties,
    COUNT(*) FILTER (WHERE cache_expires_at > NOW()) as active_cache_count,
    COUNT(*) FILTER (WHERE cache_expires_at <= NOW()) as expired_cache_count,
    AVG(access_count) as avg_access_count,
    MAX(last_accessed) as most_recently_accessed,
    MIN(created_at) as oldest_cache_entry,
    NOW() as last_updated
FROM public.property_data_cache
GROUP BY data_source
ORDER BY total_cached_properties DESC;

-- ========================================
-- INDEXES FOR MATERIALIZED VIEWS
-- ========================================

-- Refresh function for analytics
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.search_analytics_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_credit_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.property_cache_stats;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.search_analytics_daily TO authenticated;
GRANT SELECT ON public.user_credit_summary TO authenticated;
GRANT SELECT ON public.property_cache_stats TO authenticated;
