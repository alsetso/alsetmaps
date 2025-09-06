'use client';

import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { toast } from 'sonner';

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentMethodForm({ onSuccess, onCancel }: PaymentMethodFormProps) {
  const handleSubmit = () => {
    // Placeholder implementation - Stripe services have been removed
    toast.info('Payment method functionality is currently disabled');
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Payment Method</CardTitle>
        <CardDescription>
          Payment method functionality is currently disabled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50 text-gray-500 text-center">
            Payment method form is temporarily disabled
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled
            >
              Add Payment Method
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
