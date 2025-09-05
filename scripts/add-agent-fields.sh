#!/bin/bash

# Script to add agent fields to for_sale table
# This script runs the SQL migration to add agent information fields

echo "🚀 Adding agent fields to for_sale table..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run this from the project root."
    exit 1
fi

# Run the migration
echo "📝 Running migration..."
supabase db reset --db-url "$(grep 'DB_URL' .env.local | cut -d '=' -f2-)" < supabase/database/tables/add_agent_fields_to_for_sale.sql

if [ $? -eq 0 ]; then
    echo "✅ Successfully added agent fields to for_sale table!"
    echo ""
    echo "New fields added:"
    echo "  - agent_name (TEXT)"
    echo "  - agent_company (TEXT)" 
    echo "  - agent_phone (TEXT)"
    echo "  - agent_email (TEXT)"
    echo ""
    echo "Features added:"
    echo "  - Validation trigger for agent info when for_sale_by = 'agent'"
    echo "  - Indexes for faster queries"
    echo "  - Proper RLS policies"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi

