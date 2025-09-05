import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';
import { StripeService } from '@/integrations/stripe/stripe-service';

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
      .select('stripe_customer_id')
      .eq('auth_user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (!account.stripe_customer_id) {
      return NextResponse.json({ paymentMethods: [] });
    }

    // Get payment methods from Stripe
    const result = await StripeService.getPaymentMethods(account.stripe_customer_id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ paymentMethods: result.paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
      .select('id, stripe_customer_id, email, first_name, last_name')
      .eq('auth_user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    let customerId = account.stripe_customer_id;

    // Create Stripe customer if one doesn't exist
    if (!customerId) {
      const name = account.first_name && account.last_name 
        ? `${account.first_name} ${account.last_name}` 
        : undefined;
      
      customerId = await StripeService.createOrGetCustomer(account.email, name);
      
      if (!customerId) {
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
      }

      // Update account with Stripe customer ID
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('id', account.id);

      if (updateError) {
        console.error('Error updating account with Stripe customer ID:', updateError);
      }
    }

    // Create setup intent for adding payment method
    const result = await StripeService.createSetupIntent(customerId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      clientSecret: result.clientSecret,
      paymentMethodId: result.paymentMethodId 
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('paymentMethodId');

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }

    // Create supabase client
    const supabase = createServerSupabaseClientFromRequest(request);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete payment method from Stripe
    const result = await StripeService.deletePaymentMethod(paymentMethodId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
