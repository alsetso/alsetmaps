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
      .eq('id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Get credit transactions history
    const { data: transactions, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select(`
        id,
        transaction_type,
        credit_type,
        amount,
        description,
        metadata,
        created_at
      `)
      .eq('user_id', account.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (transactionsError) {
      console.error('Error fetching credit transactions:', transactionsError);
      return NextResponse.json({ error: 'Failed to fetch transaction history' }, { status: 500 });
    }

    // Format transactions for display
    const formattedTransactions = (transactions || []).map(transaction => ({
      id: transaction.id,
      type: transaction.transaction_type,
      creditType: transaction.credit_type,
      amount: transaction.amount,
      description: transaction.description,
      metadata: transaction.metadata,
      date: transaction.created_at,
      // Format for display
      displayAmount: transaction.amount > 0 ? `+${transaction.amount}` : `${transaction.amount}`,
      displayType: transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1),
    }));

    return NextResponse.json({ 
      transactions: formattedTransactions,
      total: formattedTransactions.length
    });

  } catch (error) {
    console.error('Error in credit transactions history API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
