import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/integrations/stripe/client';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { userId, packageId, returnUrl } = await request.json();

    if (!userId || !packageId || !returnUrl) {
      return NextResponse.json(
        { error: 'User ID, package ID, and return URL are required' },
        { status: 400 }
      );
    }

    // Get credit package details
    const { data: creditPackage, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !creditPackage) {
      return NextResponse.json(
        { error: 'Credit package not found' },
        { status: 404 }
      );
    }

    // Get user's Stripe customer ID from the database
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('stripe_customer_id, email, first_name, last_name')
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
      const customer = await stripe.customers.create({
        email: account.email,
        name: `${account.first_name || ''} ${account.last_name || ''}`.trim() || undefined,
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

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: creditPackage.name,
              description: `${creditPackage.credits} credits for property searches`,
            },
            unit_amount: creditPackage.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl}?success=true&package=${packageId}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        user_id: userId,
        package_id: packageId,
        credits: creditPackage.credits.toString(),
        package_name: creditPackage.name
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
