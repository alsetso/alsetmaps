import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/integrations/stripe/client';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID from the database
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    let customerId = account.stripe_customer_id;

    // If user doesn't have a Stripe customer ID, create one
    if (!customerId) {
      const { data: userData, error: userError } = await supabase
        .from('accounts')
        .select('email, first_name, last_name')
        .eq('user_id', userId)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'User data not found' },
          { status: 404 }
        );
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: userData.email,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
        metadata: {
          user_id: userId
        }
      });

      customerId = customer.id;

      // Update user account with Stripe customer ID
      await supabase
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get('origin')}/settings`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
