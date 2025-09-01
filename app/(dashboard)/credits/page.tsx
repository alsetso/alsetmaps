'use client';

import React, { useState, useEffect } from 'react';
import { CreditStatusDisplay } from '@/features/credit-system/components/CreditStatusDisplay';
import { CreditPurchaseModal } from '@/features/credit-system/components/CreditPurchaseModal';
import { CreditService } from '@/features/credit-system/services/credit-service';
import { CreditPackage, CreditHistoryItem, CreditUsageBreakdown } from '@/features/credit-system/types/credit-system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Badge } from '@/features/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/components/ui/tabs';
import { 
  CreditCard, 
  History, 
  BarChart3, 
  TrendingUp, 
  Zap,
  Crown
} from 'lucide-react';

export default function CreditsPage() {
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [creditHistory, setCreditHistory] = useState<CreditHistoryItem[]>([]);
  const [usageBreakdown, setUsageBreakdown] = useState<CreditUsageBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreditData();
  }, []);

  const loadCreditData = async () => {
    try {
      setLoading(true);
      const [packages, history, breakdown] = await Promise.all([
        CreditService.getCreditPackages(),
        CreditService.getCreditHistory(100),
        CreditService.getCreditUsageBreakdown()
      ]);
      setCreditPackages(packages);
      setCreditHistory(history);
      setUsageBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to load credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    // This would integrate with your payment system
    console.log('Purchasing package:', packageId);
    // After successful purchase, reload data
    await loadCreditData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'search':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'pin':
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'intent':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'research':
        return <BarChart3 className="h-4 w-4 text-orange-600" />;
      case 'market_analysis':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credits & Subscriptions</h1>
        <p className="text-gray-600">
          Manage your search credits and subscription plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Credit Status */}
        <div className="lg:col-span-2">
          <CreditStatusDisplay />
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CreditPurchaseModal
                packages={creditPackages}
                onPurchase={handlePurchase}
                trigger={
                  <Button className="w-full" size="lg">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Credits
                  </Button>
                }
              />
              
              <Button variant="outline" className="w-full" size="lg">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          {usageBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Searches</span>
                  <Badge variant="secondary">{usageBreakdown.searches}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pins Created</span>
                  <Badge variant="secondary">{usageBreakdown.pins}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Market Analysis</span>
                  <Badge variant="secondary">{usageBreakdown.market_analysis}</Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Credits Used</span>
                    <span className="text-blue-600">{usageBreakdown.total_credits_used}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="packages">Credit Packages</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Credit Transaction History
              </CardTitle>
              <CardDescription>
                View all your credit transactions and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {creditHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {getActionIcon(item.action_type)}
                      <div>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(item.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        item.action_type === 'usage' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.action_type === 'usage' ? '-' : '+'}{item.credits_used}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.action_type === 'usage' ? 'Credits Used' : 'Credits Added'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Available Credit Packages
              </CardTitle>
              <CardDescription>
                Choose the package that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {pkg.credits}
                        </div>
                        <div className="text-sm text-gray-500">Credits</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{pkg.name}</div>
                        <div className="text-sm text-gray-500">
                          ${(pkg.price_cents / 100 / pkg.credits).toFixed(3)} per credit
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${(pkg.price_cents / 100).toFixed(2)}
                      </div>
                      <CreditPurchaseModal
                        packages={[pkg]}
                        onPurchase={handlePurchase}
                        trigger={
                          <Button size="sm" className="mt-2">
                            Select Package
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Analytics
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your credit usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageBreakdown && (
                <div className="space-y-6">
                  {/* Usage by Category */}
                  <div>
                    <h4 className="font-medium mb-3">Usage by Category</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {usageBreakdown.searches}
                        </div>
                        <div className="text-sm text-blue-600">Searches</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {usageBreakdown.pins}
                        </div>
                        <div className="text-sm text-green-600">Pins</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {usageBreakdown.intents}
                        </div>
                        <div className="text-sm text-purple-600">Intents</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {usageBreakdown.research}
                        </div>
                        <div className="text-sm text-orange-600">Research</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-600">
                          {usageBreakdown.market_analysis}
                        </div>
                        <div className="text-sm text-red-600">Analysis</div>
                      </div>
                    </div>
                  </div>

                  {/* Total Usage */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {usageBreakdown.total_credits_used}
                      </div>
                      <div className="text-gray-600">Total Credits Used</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
