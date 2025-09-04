# Database Schema Structure

This directory contains the complete database schema for the Alset property search platform, organized for optimal performance and maintainability.

## 📁 Directory Structure

```
supabase/database/
├── tables/           # Table definitions and constraints
├── indexes/          # Performance indexes (separate from tables)
├── functions/        # Database functions and triggers
├── policies/         # Row Level Security (RLS) policies
└── README.md         # This file
```

## 🗄️ Tables

### Core Tables
- **`accounts`** - User account information and authentication
- **`user_credits`** - Current credit balance and totals for each user
- **`credit_transactions`** - Complete audit trail of all credit movements
- **`credit_packages`** - Available credit packages for purchase
- **`user_subscriptions`** - User subscription plans and billing information

### Search & Cache Tables
- **`search_history`** - User search history and metadata
- **`search_results`** - Search results linked to search history
- **`property_data_cache`** - Cached property data to reduce API calls

## ⚡ Performance Indexes

The `indexes/` directory contains only the **essential indexes** for optimal performance:

### Critical Indexes
- User credit balance queries
- Credit transaction history
- Search history by user
- Property cache lookups
- Active subscription queries

### Index Strategy
- **Minimal indexing** to avoid INSERT/UPDATE performance degradation
- **Partial indexes** for active data only
- **Composite indexes** for common query patterns
- **Analytics indexes** commented out (enable only if needed)

## 🔧 Functions

### Credit Management
- `add_credits_atomic()` - Safely add credits
- `consume_credits_atomic()` - Safely consume credits
- `purchase_credits()` - Handle credit purchases
- `refresh_monthly_credits()` - Monthly subscription credits

### Property Search
- `get_cached_property_data()` - Retrieve cached property data
- `get_user_search_history()` - Get user search history
- `update_search_success()` - Update search status

### Triggers
- `handle_new_user()` - Create user credits on signup
- `update_credit_balance_trigger()` - Auto-update credit balance

## 🛡️ Security Policies

### Row Level Security (RLS)
- **Accounts**: Users can only access their own account
- **Credits**: Users can only view their own credit information
- **Search History**: Users can only see their own searches
- **Subscriptions**: Users can only manage their own subscriptions

## 🚀 Performance Characteristics

### Query Performance
- **Credit queries**: O(log n) with optimized indexes
- **Search history**: O(log n) with user + date indexes
- **Property cache**: O(1) with normalized address index
- **Subscription queries**: O(log n) with status + period indexes

### Index Maintenance
- **Minimal overhead** on INSERT/UPDATE operations
- **Partial indexes** reduce storage and maintenance
- **Composite indexes** cover multiple query patterns

## 📊 Analytics

### Materialized Views
- **`search_analytics_daily`** - Daily search statistics
- **`user_credit_summary`** - User credit overview
- **`property_cache_stats`** - Cache performance metrics

### Refresh Strategy
- Use `refresh_analytics_views()` function
- Schedule with cron or database triggers
- Optimized for read-heavy analytics workloads

## 🔄 Deployment

### Development
```sql
-- Run in order:
\i tables/tables.sql
\i indexes/performance_indexes.sql
\i functions/functions.sql
\i policies/policies.sql
```

### Production
```sql
-- Use the same order, but consider:
-- 1. Test indexes on staging first
-- 2. Monitor query performance
-- 3. Use analyze_index_usage() to identify unused indexes
```

## 📈 Monitoring

### Index Usage Analysis
```sql
SELECT * FROM analyze_index_usage();
```

### Performance Metrics
- Monitor query execution times
- Watch for index bloat
- Track cache hit rates
- Monitor credit transaction volumes

## 🎯 Best Practices

1. **Start with minimal indexes** - add more only when needed
2. **Use partial indexes** for filtered data
3. **Monitor index usage** regularly
4. **Test performance** before adding new indexes
5. **Keep tables lean** with proper constraints
6. **Use materialized views** for complex analytics

## 🚨 Important Notes

- **Never add indexes without testing** their impact on INSERT/UPDATE performance
- **Partial indexes** are preferred over full indexes when possible
- **Composite indexes** should cover the most common query patterns
- **Analytics indexes** should only be enabled if you're doing heavy reporting
- **Regular maintenance** is required for optimal performance

