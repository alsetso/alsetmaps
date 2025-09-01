'use client';

import React, { useState } from 'react';
import { CreditPackage } from '../types/credit-system';
import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/features/shared/components/ui/dialog';
import { Badge } from '@/features/shared/components/ui/badge';
import { CreditCard, Crown, Zap, Check } from 'lucide-react';

interface CreditPurchaseModalProps {
  packages: CreditPackage[];
  onPurchase: (packageId: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({ 
  packages, 
  onPurchase, 
  trigger 
}) => {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    try {
      setLoading(true);
      await onPurchase(selectedPackage.id);
      setIsOpen(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getPricePerCredit = (cents: number, credits: number) => {
    return (cents / credits / 100).toFixed(3);
  };

  const isPremiumPackage = (pkg: CreditPackage) => {
    return pkg.name.toLowerCase().includes('premium') || pkg.name.toLowerCase().includes('monthly');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Buy Credits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package that fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Package Selection */}
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPackage?.id === pkg.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : ''
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isPremiumPackage(pkg) ? (
                          <Crown className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <Zap className="h-5 w-5 text-blue-600" />
                        )}
                        <div>
                          <div className="font-semibold text-lg">{pkg.name}</div>
                          <div className="text-sm text-gray-500">
                            {pkg.credits} credits
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(pkg.price_cents)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${getPricePerCredit(pkg.price_cents, pkg.credits)} per credit
                      </div>
                    </div>
                  </div>

                  {/* Best Value Badge */}
                  {pkg.credits === 200 && (
                    <div className="mt-3 flex justify-center">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Best Value
                      </Badge>
                    </div>
                  )}

                  {/* Premium Benefits */}
                  {isPremiumPackage(pkg) && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="text-sm text-yellow-800">
                        <strong>Premium Benefits:</strong> 50 credits per month, priority support, advanced analytics
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Purchase Button */}
          {selectedPackage && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">Selected Package:</div>
                  <div className="text-sm text-gray-500">
                    {selectedPackage.name} - {selectedPackage.credits} credits
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(selectedPackage.price_cents)}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handlePurchase} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Purchase {selectedPackage.credits} Credits
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
