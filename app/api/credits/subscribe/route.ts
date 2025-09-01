import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';
import { stripe } from '@/integrations/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const { paymentMethodId } = await request.json();

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    
    const { data: account } = await supabase
      .from('accounts')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (account?.stripe_customer_id) {
      stripeCustomerId = account.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });

      stripeCustomerId = customer.id;

      // Update account with Stripe customer ID
      await supabase
        .from('accounts')
        .upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: stripeCustomerId
        });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscriptionResponse = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID, // You'll need to create this price in Stripe
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: user.id
      }
    });

    // Update user's subscription status
    await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        subscription_plan: 'premium',
        stripe_subscription_id: subscriptionResponse.id,
        subscription_expires_at: null // Will be set when subscription is active
      });

    return NextResponse.json({
      success: true,
      subscription_id: subscriptionResponse.id,
      status: subscriptionResponse.status
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const { data: userCredits } = await supabase
      .from('user_credits')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (userCredits?.stripe_subscription_id) {
      // Cancel subscription in Stripe
      await stripe.subscriptions.cancel(userCredits.stripe_subscription_id);

      // Update local subscription status
      await supabase
        .from('user_credits')
        .update({
          subscription_plan: 'free',
          stripe_subscription_id: null,
          subscription_expires_at: null
        })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
