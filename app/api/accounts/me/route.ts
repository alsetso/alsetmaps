import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🚨 ACCOUNTS/ME API: Starting request');
    
    // Create supabase client with request
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🚨 ACCOUNTS/ME API: Auth result', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message
    });
    
    if (authError || !user) {
      console.log('🚨 ACCOUNTS/ME API: Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up the user's account (id now equals auth user id)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, email, created_at')
      .eq('id', user.id)
      .single();

    console.log('🚨 ACCOUNTS/ME API: Account lookup', { 
      authUserId: user.id,
      accountId: account?.id, 
      accountError: accountError?.message
    });

    if (accountError || !account) {
      console.log('❌ Accounts/Me API: Account not found');
      return NextResponse.json({ 
        error: 'Account not found',
        details: accountError?.message 
      }, { status: 404 });
    }

    console.log('✅ Accounts/Me API: Successfully returning account data');
    return NextResponse.json({ 
      account: account,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Accounts/Me API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
