const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse env file
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function queryDatabase() {
  try {
    console.log('🔗 Connected to Supabase successfully!');
    console.log('URL:', envVars.NEXT_PUBLIC_SUPABASE_URL);
    
    // Try to query the information_schema directly using raw SQL
    console.log('\n🔍 Attempting to query information_schema...');
    
    try {
      // Try different approaches to get table list
      const queries = [
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
        "SELECT name FROM sqlite_master WHERE type='table'"
      ];
      
      for (const query of queries) {
        try {
          console.log(`\nTrying query: ${query}`);
          const { data, error } = await supabase.rpc('exec', { sql: query });
          
          if (!error && data) {
            console.log('✅ Query successful!');
            console.log('Tables found:', data);
            return;
          } else {
            console.log('❌ Query failed:', error?.message || 'Unknown error');
          }
        } catch (err) {
          console.log('❌ Query error:', err.message);
        }
      }
    } catch (err) {
      console.log('❌ Raw SQL approach failed:', err.message);
    }
    
    // Try to access tables one by one with different approaches
    console.log('\n🔍 Trying individual table access...');
    
    const possibleTables = [
      'accounts', 'credits', 'pin_terms_analytics', 'pin_visitor_analytics', 
      'pins', 'public_pins', 'public_pins_with_smart_data', 'search_history', 
      'visitor_sessions', 'users', 'profiles', 'properties', 'intents'
    ];
    
    for (const tableName of possibleTables) {
      try {
        // Try different select approaches
        const approaches = [
          () => supabase.from(tableName).select('*').limit(1),
          () => supabase.from(tableName).select('id').limit(1),
          () => supabase.from(tableName).select('*', { count: 'exact', head: true })
        ];
        
        for (const approach of approaches) {
          try {
            const result = await approach();
            if (!result.error) {
              console.log(`✅ Found table: ${tableName}`);
              if (result.count !== undefined) {
                console.log(`   Rows: ${result.count}`);
              }
              if (result.data && result.data.length > 0) {
                console.log(`   Columns: ${Object.keys(result.data[0]).join(', ')}`);
              }
              break;
            }
          } catch (err) {
            // Continue to next approach
          }
        }
      } catch (err) {
        // Table doesn't exist
      }
    }
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

queryDatabase();
