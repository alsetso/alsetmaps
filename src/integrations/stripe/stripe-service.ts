import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface CreatePaymentMethodResult {
  success: boolean;
  paymentMethodId?: string;
  clientSecret?: string;
  error?: string;
}

export interface PaymentMethodsResult {
  success: boolean;
  paymentMethods?: PaymentMethod[];
  error?: string;
}

export class StripeService {
  /**
   * Create a Stripe customer if one doesn't exist
   */
  static async createOrGetCustomer(email: string, name?: string): Promise<string | null> {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0].id;
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: email,
        name: name,
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating/getting Stripe customer:', error);
      return null;
    }
  }

  /**
   * Create a setup intent for adding a payment method
   */
  static async createSetupIntent(customerId: string): Promise<CreatePaymentMethodResult> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });

      return {
        success: true,
        paymentMethodId: setupIntent.payment_method as string,
        clientSecret: setupIntent.client_secret!,
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create setup intent',
      };
    }
  }

  /**
   * Get all payment methods for a customer
   */
  static async getPaymentMethods(customerId: string): Promise<PaymentMethodsResult> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const formattedPaymentMethods: PaymentMethod[] = paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        last4: pm.card?.last4 || '',
        brand: pm.card?.brand || '',
        exp_month: pm.card?.exp_month || 0,
        exp_year: pm.card?.exp_year || 0,
        is_default: false, // This would need to be tracked separately or via customer metadata
      }));

      return {
        success: true,
        paymentMethods: formattedPaymentMethods,
      };
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment methods',
      };
    }
  }

  /**
   * Delete a payment method
   */
  static async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await stripe.paymentMethods.detach(paymentMethodId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete payment method',
      };
    }
  }

  /**
   * Set a payment method as default for a customer
   */
  static async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set default payment method',
      };
    }
  }

  /**
   * Create a payment intent for purchasing credits
   */
  static async createPaymentIntent(
    customerId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<{ success: boolean; clientSecret?: string; error?: string }> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: currency,
        customer: customerId,
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      };
    }
  }

  /**
   * Retrieve a payment intent to check its status
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<{ success: boolean; paymentIntent?: Stripe.PaymentIntent; error?: string }> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        paymentIntent: paymentIntent,
      };
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
      };
    }
  }

  /**
   * Create a subscription for recurring credit purchases
   */
  static async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId?: string
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      };

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);

      return {
        success: true,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription',
      };
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await stripe.subscriptions.cancel(subscriptionId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      };
    }
  }
}
