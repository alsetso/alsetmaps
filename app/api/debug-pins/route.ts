import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Pins API: Starting comprehensive debug');
    
    const supabaseAdmin = createServerSupabaseClient();
    const supabaseUser = createServerSupabaseClientFromRequest(request);
    
    // Test 1: Check if pins table exists and has data
    const { data: allPins, error: allPinsError } = await supabaseAdmin
      .from('pins')
      .select('id, user_id, created_at, is_public')
      .limit(10);
    
    console.log('🔍 Debug: All pins (admin)', {
      count: allPins?.length || 0,
      error: allPinsError?.message,
      sample: allPins?.[0]
    });
    
    // Test 2: Check accounts table
    const { data: allAccounts, error: allAccountsError } = await supabaseAdmin
      .from('accounts')
      .select('id, auth_user_id, email')
      .limit(5);
    
    console.log('🔍 Debug: All accounts (admin)', {
      count: allAccounts?.length || 0,
      error: allAccountsError?.message,
      sample: allAccounts?.[0]
    });
    
    // Test 3: Check user session
    const { data: { session }, error: sessionError } = await supabaseUser.auth.getSession();
    
    console.log('🔍 Debug: User session', {
      hasSession: !!session,
      userId: session?.user?.id,
      error: sessionError?.message
    });
    
    // Test 4: Check user's account
    let userAccount = null;
    if (session?.user) {
      const { data: account, error: accountError } = await supabaseUser
        .from('accounts')
        .select('id, auth_user_id, email')
        .eq('auth_user_id', session.user.id)
        .single();
      
      userAccount = account;
      console.log('🔍 Debug: User account', {
        hasAccount: !!account,
        accountId: account?.id,
        error: accountError?.message
      });
    }
    
    // Test 5: Try to fetch user's pins with user context
    let userPins = null;
    let userPinsError = null;
    if (userAccount) {
      const { data: pins, error: pinsError } = await supabaseUser
        .from('pins')
        .select('id, user_id, created_at, is_public')
        .eq('user_id', userAccount.id)
        .limit(5);
      
      userPins = pins;
      userPinsError = pinsError;
      
      console.log('🔍 Debug: User pins (user context)', {
        count: pins?.length || 0,
        error: pinsError?.message,
        errorCode: pinsError?.code
      });
    }
    
    // Test 6: Try to fetch user's pins with admin context
    let adminPins = null;
    let adminPinsError = null;
    if (userAccount) {
      const { data: pins, error: pinsError } = await supabaseAdmin
        .from('pins')
        .select('id, user_id, created_at, is_public')
        .eq('user_id', userAccount.id)
        .limit(5);
      
      adminPins = pins;
      adminPinsError = pinsError;
      
      console.log('🔍 Debug: User pins (admin context)', {
        count: pins?.length || 0,
        error: pinsError?.message
      });
    }
    
    // Test 7: Check RLS policies
    let policies, policiesError;
    try {
      const result = await supabaseAdmin
        .rpc('get_policies_for_table', { table_name: 'pins' });
      policies = result.data;
      policiesError = result.error;
    } catch (error) {
      policies = null;
      policiesError = { message: 'RPC not available' };
    }
    
    console.log('🔍 Debug: RLS policies', {
      hasPolicies: !!policies,
      error: policiesError?.message
    });
    
    return NextResponse.json({
      success: true,
      debug: {
        pins: {
          total: allPins?.length || 0,
          sample: allPins?.[0],
          error: allPinsError?.message
        },
        accounts: {
          total: allAccounts?.length || 0,
          sample: allAccounts?.[0],
          error: allAccountsError?.message
        },
        session: {
          hasSession: !!session,
          userId: session?.user?.id,
          error: sessionError?.message
        },
        userAccount: {
          hasAccount: !!userAccount,
          accountId: userAccount?.id,
          authUserId: userAccount?.auth_user_id
        },
        userPins: {
          count: userPins?.length || 0,
          data: userPins,
          error: userPinsError?.message,
          errorCode: userPinsError?.code
        },
        adminPins: {
          count: adminPins?.length || 0,
          data: adminPins,
          error: adminPinsError?.message
        },
        rlsPolicies: {
          available: !!policies,
          error: policiesError?.message
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Debug Pins API: Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
