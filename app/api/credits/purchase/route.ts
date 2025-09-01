import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';
import { stripe } from '@/integrations/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const { packageId, paymentMethodId } = await request.json();

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get credit package details
    const { data: creditPackage, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !creditPackage) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 });
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: creditPackage.price_cents,
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        package_id: packageId,
        credits: creditPackage.credits.toString(),
        user_id: user.id
      },
      return_url: `${request.nextUrl.origin}/dashboard/credits?success=true`
    });

    if (paymentIntent.status === 'succeeded') {
      // Add credits to user account
      await supabase.rpc('add_credits', {
        user_uuid: user.id,
        credits_to_add: creditPackage.credits,
        transaction_type: 'purchase',
        description: `Purchased ${creditPackage.credits} credits`,
        stripe_payment_intent_id: paymentIntent.id
      });

      return NextResponse.json({
        success: true,
        credits_added: creditPackage.credits,
        payment_intent_id: paymentIntent.id
      });
    } else {
      return NextResponse.json({
        error: 'Payment failed',
        status: paymentIntent.status
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Credit purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
