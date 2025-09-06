import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the user's account ID from the accounts table (now using auth.users.id directly)
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', session.user.id) // Changed from 'auth_user_id'
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const searchHistoryId = params.id;

    // Fetch the search history with user verification
    const { data: searchHistory, error: searchError } = await supabase
      .from('search_history')
      .select('*')
      .eq('id', searchHistoryId)
      .eq('account_id', accountData.id) // Changed from 'user_id'
      .single();

    if (searchError || !searchHistory) {
      return NextResponse.json({ error: 'Search history not found' }, { status: 404 });
    }

    return NextResponse.json(searchHistory);

  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
