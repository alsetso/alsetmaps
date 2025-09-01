'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { OptimizedCreditService } from '@/features/credit-system/services/optimized-credit-service';
import { SettingsService, UserSubscription, CreditPackage } from '@/features/user-dashboard/services/settings-service';
import { toast } from '@/lib/toast';

interface CreditBalance {
  availableCredits: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  lastUpdated: string;
}

interface CreditTransaction {
  id: string;
  actionType: string;
  creditsConsumed: number;
  creditsAdded: number;
  description: string;
  referenceId?: string;
  referenceTable?: string;
  transactionHash: string;
  createdAt: string;
  metadata: Record<string, any>;
}

interface UserSubscription {
  user_id: string;
  stripe_subscription_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  credits_per_month: number;
  created_at: string;
  updated_at: string;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  is_popular: boolean;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
      loadCreditPackages();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Load credit balance
      const balance = await OptimizedCreditService.getCreditBalance(user.id);
      setCreditBalance(balance);
      
      // Load transaction history
      const txHistory = await OptimizedCreditService.getTransactionHistory(user.id, 20, 0);
      setTransactions(txHistory);
      
      // Load subscription data
      await loadSubscriptionData();
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscriptionData = async () => {
    if (!user?.id) return;
    
    try {
      const subscriptionData = await SettingsService.getUserSubscription(user.id);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const loadCreditPackages = async () => {
    try {
      const packages = await SettingsService.getCreditPackages();
      setCreditPackages(packages);
    } catch (error) {
      console.error('Error loading credit packages:', error);
    }
  };

  const refreshCredits = async () => {
    if (!user?.id) return;
    
    try {
      setIsRefreshing(true);
      await loadUserData();
      toast.success('Credits refreshed successfully');
    } catch (error) {
      console.error('Error refreshing credits:', error);
      toast.error('Failed to refresh credits');
    } finally {
      setIsRefreshing(false);
    }
  };

  const openStripeBillingPortal = async () => {
    try {
      // This would call your API to create a Stripe billing portal session
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create billing portal session');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const purchaseCredits = async (packageId: string) => {
    try {
      // This would redirect to Stripe Checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          packageId,
          returnUrl: window.location.href
        })
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast.error('Failed to initiate credit purchase');
    }
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (actionType: string) => {
    switch (actionType) {
      case 'search_smart':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'purchase':
        return <PlusIcon className="h-5 w-5 text-green-500" />;
      case 'subscription_renewal':
        return <CheckCircleIcon className="h-5 w-5 text-purple-500" />;
      case 'refund':
        return <MinusIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionLabel = (actionType: string) => {
    switch (actionType) {
      case 'search_smart':
        return 'Smart Search';
      case 'purchase':
        return 'Credit Purchase';
      case 'subscription_renewal':
        return 'Monthly Renewal';
      case 'refund':
        return 'Credit Refund';
      default:
        return actionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your subscription, credits, and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credit Status Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Credit Balance</h2>
                <button
                  onClick={refreshCredits}
                  disabled={isRefreshing}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {creditBalance ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {creditBalance.availableCredits}
                    </div>
                    <div className="text-sm text-gray-500">Credits Available</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Total Earned</div>
                      <div className="font-medium">{creditBalance.totalCreditsEarned}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total Spent</div>
                      <div className="font-medium">{creditBalance.totalCreditsSpent}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 text-center">
                    Last updated: {formatDate(creditBalance.lastUpdated)}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">Loading credits...</div>
              )}
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CreditCardIcon className="h-6 w-6 text-purple-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
              </div>
              
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status === 'active' ? 'Active' : subscription.status}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <div className="text-gray-500">Plan</div>
                    <div className="font-medium">{subscription.plan_type} - {subscription.credits_per_month} credits/month</div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="text-gray-500">Next Renewal</div>
                    <div className="font-medium">{formatDate(subscription.current_period_end)}</div>
                  </div>
                  
                  <button
                    onClick={openStripeBillingPortal}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Manage Subscription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center text-gray-500">
                    <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>No active subscription</p>
                  </div>
                  
                  <button
                    onClick={openStripeBillingPortal}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Buy Credits</h2>
              </div>
              
              <div className="space-y-3">
                {creditPackages.map((pkg) => (
                  <div key={pkg.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{pkg.name}</span>
                      {pkg.is_popular && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(pkg.price_cents)}
                      </span>
                      <span className="text-sm text-gray-500">{pkg.credits} credits</span>
                    </div>
                    
                    <button
                      onClick={() => purchaseCredits(pkg.id)}
                      className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              <p className="text-sm text-gray-600">Your recent credit transactions</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.actionType)}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {getTransactionLabel(transaction.actionType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {transaction.creditsAdded > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                +{transaction.creditsAdded}
                              </span>
                            )}
                            {transaction.creditsConsumed > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                -{transaction.creditsConsumed}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                          {transaction.transactionHash.substring(0, 8)}...
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No transactions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
