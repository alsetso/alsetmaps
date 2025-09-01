'use client';

import React, { useState, useEffect } from 'react';
import { CreditService } from '../services/credit-service';
import { CreditStatus, CreditPackage } from '../types/credit-system';
import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import { CreditCard, Zap, RefreshCw, Crown } from 'lucide-react';

interface CreditStatusDisplayProps {
  className?: string;
}

export const CreditStatusDisplay: React.FC<CreditStatusDisplayProps> = ({ className }) => {
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPackages, setShowPackages] = useState(false);

  useEffect(() => {
    loadCreditData();
  }, []);

  const loadCreditData = async () => {
    try {
      setLoading(true);
      const [status, packages] = await Promise.all([
        CreditService.getUserCreditStatus(),
        CreditService.getCreditPackages()
      ]);
      setCreditStatus(status);
      setCreditPackages(packages);
    } catch (error) {
      console.error('Failed to load credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCreditData();
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTimeUntilReset = () => {
    if (!creditStatus) return '';
    
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(24, 0, 0, 0);
    
    const diff = resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!creditStatus) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-gray-500">Failed to load credit status</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Status
          </CardTitle>
          <CardDescription>
            Manage your search credits and subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {creditStatus.available_credits}
              </div>
              <div className="text-sm text-blue-600">Available Credits</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {creditStatus.total_credits}
              </div>
              <div className="text-sm text-green-600">Total Credits</div>
            </div>
          </div>

          {/* Plan Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {creditStatus.subscription_plan === 'premium' ? (
                <Crown className="h-5 w-5 text-yellow-600" />
              ) : (
                <Zap className="h-5 w-5 text-blue-600" />
              )}
              <span className="font-medium">
                {creditStatus.subscription_plan === 'premium' ? 'Premium Plan' : 'Free Plan'}
              </span>
            </div>
            <Badge variant={creditStatus.subscription_plan === 'premium' ? 'default' : 'secondary'}>
              {creditStatus.subscription_plan === 'premium' ? 'Active' : 'Free'}
            </Badge>
          </div>

          {/* Free Credits Info */}
          {creditStatus.subscription_plan === 'free' && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-700">
                  Free credits reset in: {getTimeUntilReset()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-6 px-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                {creditStatus.free_credits_remaining} of 5 free credits remaining today
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPackages(!showPackages)}
              className="flex-1"
            >
              {showPackages ? 'Hide Packages' : 'Buy Credits'}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Credit Packages */}
          {showPackages && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm text-gray-700">Available Packages</h4>
              <div className="grid gap-3">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-gray-500">{pkg.credits} credits</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatPrice(pkg.price_cents)}
                      </div>
                      <Button size="sm" variant="outline">
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
