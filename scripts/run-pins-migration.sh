#!/bin/bash

# Script to run the pins migration that adds auth_user_id field
# This simplifies RLS policies and improves performance

echo "🚀 Running pins migration to add auth_user_id field..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if the migration file exists
MIGRATION_FILE="supabase/migrations/20250115000000_add_auth_user_id_to_pins.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📁 Found migration file: $MIGRATION_FILE"

# Check if we have the required environment variables
if [ -z "$DATABASE_URL" ] && [ -z "$SUPABASE_DB_URL" ]; then
    echo "⚠️  Warning: No DATABASE_URL or SUPABASE_DB_URL found in environment"
    echo "   You may need to set your database connection string"
    echo "   Example: export DATABASE_URL='postgresql://user:pass@host:port/db'"
    echo ""
    echo "   Or run this migration manually in your Supabase dashboard"
    echo "   File: $MIGRATION_FILE"
    exit 1
fi

# Use DATABASE_URL if available, otherwise use SUPABASE_DB_URL
DB_URL=${DATABASE_URL:-$SUPABASE_DB_URL}

echo "🔗 Using database URL: ${DB_URL:0:20}..."

# Run the migration
echo "📝 Executing migration..."
psql "$DB_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🎉 Benefits of this migration:"
    echo "   • Simplified RLS policies (no more complex subqueries)"
    echo "   • Better performance for pin ownership checks"
    echo "   • Direct auth.users relationship for easier debugging"
    echo "   • Maintains backward compatibility with accounts table"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test your property pages to ensure they work correctly"
    echo "   2. Monitor performance improvements"
    echo "   3. Consider applying similar pattern to other tables if needed"
else
    echo "❌ Migration failed!"
    echo "   Check the error messages above and fix any issues"
    echo "   You may need to run this migration manually in your Supabase dashboard"
    exit 1
fi
