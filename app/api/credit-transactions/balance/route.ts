import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    // Create supabase client
    const supabase = createServerSupabaseClientFromRequest(request);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's account data
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Get credit balance from credits table
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('available_credits')
      .eq('user_id', account.id)
      .single();

    if (creditsError) {
      console.error('Error fetching credit balance:', creditsError);
      return NextResponse.json({ error: 'Failed to fetch credit balance' }, { status: 500 });
    }

    if (!credits) {
      // If no credits record exists, return 0
      return NextResponse.json({ availableCredits: 0 });
    }

    return NextResponse.json({ 
      availableCredits: credits.available_credits || 0 
    });

  } catch (error) {
    console.error('Error in credit balance API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
