import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';
import { StripeService } from '@/integrations/stripe/stripe-service';

export async function POST(request: NextRequest) {
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
      .select('stripe_customer_id')
      .eq('auth_user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (!account.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    // Parse request body
    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }

    // Set default payment method in Stripe
    const result = await StripeService.setDefaultPaymentMethod(account.stripe_customer_id, paymentMethodId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}