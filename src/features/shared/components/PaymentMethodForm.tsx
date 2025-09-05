'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { toast } from 'sonner';
import { AccountManagementService } from '@/features/authentication/services/account-management-service';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentMethodFormContent({ onSuccess, onCancel }: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create setup intent
      const result = await AccountManagementService.createSetupIntent();
      
      if (!result.success || !result.clientSecret) {
        throw new Error(result.error || 'Failed to create setup intent');
      }

      // Confirm the setup intent with the card element
      const { error } = await stripe.confirmCardSetup(result.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Payment method added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? 'Adding...' : 'Add Payment Method'}
        </Button>
      </div>
    </form>
  );
}

export function PaymentMethodForm({ onSuccess, onCancel }: PaymentMethodFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Payment Method</CardTitle>
        <CardDescription>
          Add a new payment method to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise as any}>
          <PaymentMethodFormContent onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      </CardContent>
    </Card>
  );
}
