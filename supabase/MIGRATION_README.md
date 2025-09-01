# Database Migration Guide

## Overview

This directory contains database migrations for the Alset SO platform. The migrations are designed to be run in sequence to set up the database schema.

## Migration Files

### 1. `20250101000000_create_search_history.sql`
- Creates the search_history table for tracking user searches
- Supports both authenticated and anonymous users
- Includes RLS policies and performance indexes

### 2. `20250102000000_create_sell_table.sql` (Original - Complex RLS)
- Creates the sell table with comprehensive RLS policies
- **Note**: This migration has complex RLS policies that may cause permission issues

### 3. `20250103000000_fix_sell_table_rls.sql` (Fix for Original)
- Attempts to fix RLS policies from the original migration
- **Note**: May not resolve all permission issues

### 4. `20250104000000_create_sell_table_simple.sql` (Recommended)
- **RECOMMENDED**: Creates the sell table with simplified RLS policies
- Designed to work immediately without permission issues
- Includes all necessary functionality for both authenticated and anonymous users

## Running Migrations

### Option 1: Use the Simple Migration (Recommended)
```bash
# Run only the simple migration
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20250104000000_create_sell_table_simple.sql
```

### Option 2: Run All Migrations in Sequence
```bash
# Run migrations in order
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20250101000000_create_search_history.sql
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20250104000000_create_sell_table_simple.sql
```

### Option 3: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db reset
# This will run all migrations in the migrations folder
```

## Troubleshooting

### Permission Denied Errors
If you encounter "permission denied for table users" errors:

1. **Use the simple migration**: `20250104000000_create_sell_table_simple.sql`
2. **Check RLS policies**: Ensure the table has proper RLS policies
3. **Verify permissions**: Check that the anon and authenticated roles have proper grants

### Table Not Found Errors
If you get "relation 'sell' does not exist" errors:

1. **Run the migration**: Ensure the migration file has been executed
2. **Check schema**: Verify the table was created in the correct schema
3. **Refresh connection**: Restart your application to pick up schema changes

## Testing the Migration

After running the migration, you can test it with:

```sql
-- Check if the table exists
SELECT * FROM sell LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'sell';

-- Check permissions
SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'sell';
```

## Rollback

If you need to rollback the sell table:

```sql
-- Drop the table and all related objects
DROP TABLE IF EXISTS sell CASCADE;

-- Drop the view
DROP VIEW IF EXISTS sell_summary;

-- Drop the function
DROP FUNCTION IF EXISTS update_sell_updated_at();
```

## Support

If you continue to experience issues:

1. Check the Supabase logs for detailed error messages
2. Verify your database connection settings
3. Ensure you have the necessary permissions to create tables and policies
4. Consider using the simple migration as a starting point
