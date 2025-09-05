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

async function checkActualTables() {
  try {
    console.log('🔗 Connected to Supabase successfully!');
    console.log('URL:', envVars.NEXT_PUBLIC_SUPABASE_URL);
    
    // Based on what you told me, these are the actual tables that exist
    const actualTables = [
      'accounts',
      'credits', 
      'pin_terms_analytics',
      'pin_visitor_analytics',
      'pins',
      'public_pins',
      'public_pins_with_smart_data',
      'search_history',
      'visitor_sessions'
    ];
    
    console.log('\n🔍 Checking actual tables in your database...');
    const foundTables = [];
    const tableInfo = [];
    
    for (const tableName of actualTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          foundTables.push(tableName);
          tableInfo.push({
            name: tableName,
            count: count || 0
          });
          console.log(`✅ Found table: ${tableName} (${count || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ Table not found: ${tableName}`);
      }
    }
    
    if (foundTables.length > 0) {
      console.log(`\n📊 Summary: Found ${foundTables.length} actual tables:`);
      console.log('=====================================');
      tableInfo.forEach((table, index) => {
        console.log(`${index + 1}. ${table.name}: ${table.count} rows`);
      });
      
      // Try to get some sample data from each table
      console.log('\n🔍 Getting sample data from tables...');
      for (const table of tableInfo) {
        if (table.count > 0) {
          try {
            const { data, error } = await supabase
              .from(table.name)
              .select('*')
              .limit(2);
            
            if (!error && data && data.length > 0) {
              console.log(`\n📋 Sample data from ${table.name}:`);
              console.log('Columns:', Object.keys(data[0]));
              if (data.length > 0) {
                console.log('Sample row:', JSON.stringify(data[0], null, 2));
              }
            }
          } catch (err) {
            console.log(`❌ Cannot get sample data from ${table.name}`);
          }
        }
      }
    } else {
      console.log('❌ No actual tables found.');
    }
    
    // Check auth users
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (!authError) {
        console.log(`\n👥 Auth system: ${authUsers.users.length} users registered`);
      }
    } catch (err) {
      console.log('❌ Cannot access auth system');
    }
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

checkActualTables();
