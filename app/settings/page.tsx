'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { AccountSetupService } from '@/features/authentication/services/account-setup-service';
import { AccountManagementService } from '@/features/authentication/services/account-management-service';
import { supabase } from '@/integrations/supabase/client';
import { FloatingTopbar } from '@/features/shared/components/layout/FloatingTopbar';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/shared/components/ui/select';
import { Badge } from '@/features/shared/components/ui/badge';
import { Separator } from '@/features/shared/components/ui/separator';
import { toast } from 'sonner';
import { 
  UserIcon, 
  CreditCardIcon, 
  ShieldCheckIcon, 
  BellIcon,
  KeyIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { PaymentMethodForm } from '@/features/shared/components/PaymentMethodForm';

import type { AccountData, PaymentMethod } from '@/features/authentication/services/account-management-service';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [creditBalance, setCreditBalance] = useState<{ availableCredits: number } | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: 'buyer'
  });

  // Form validation states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasFormChanges, setHasFormChanges] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get account data
        const account = await AccountManagementService.getAccountData();
        if (account) {
          setAccountData(account);
          setFormData({
            first_name: account.first_name || '',
            last_name: account.last_name || '',
            phone: account.phone || '',
            role: account.role || 'buyer'
          });
        }

        // Get credit balance
        const creditBalance = await AccountManagementService.getCreditBalance();
        if (creditBalance) {
          setCreditBalance(creditBalance);
        }

        // Payment methods functionality has been removed
        setPaymentMethods([]);

        // Load billing history
        const historyResponse = await fetch('/api/credit-transactions/history');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setBillingHistory(historyData.transactions || []);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load account data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      errors.last_name = 'Last name must be at least 2 characters';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasFormChanges(true);
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveAccount = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before saving');
      return;
    }

    try {
      setIsSaving(true);

      const result = await AccountManagementService.updateAccountData({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Reload account data to get updated information
      const updatedAccount = await AccountManagementService.getAccountData();
      if (updatedAccount) {
        setAccountData(updatedAccount);
      }

      setHasFormChanges(false);
      toast.success('Account updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPaymentMethod = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentMethodSuccess = async () => {
    setShowPaymentForm(false);
    // Payment methods functionality has been removed
    toast.info('Payment method functionality is currently disabled');
  };

  const handlePaymentMethodCancel = () => {
    setShowPaymentForm(false);
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    // Payment methods functionality has been removed
    toast.info('Payment method functionality is currently disabled');
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    // Payment methods functionality has been removed
    toast.info('Payment method functionality is currently disabled');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <FloatingTopbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <FloatingTopbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in to access settings
            </h1>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <FloatingTopbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account information, billing, and preferences
            </p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <BellIcon className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleFormChange('first_name', e.target.value)}
                        placeholder="Enter your first name"
                        className={formErrors.first_name ? 'border-red-500' : ''}
                      />
                      {formErrors.first_name && (
                        <p className="text-sm text-red-500">{formErrors.first_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleFormChange('last_name', e.target.value)}
                        placeholder="Enter your last name"
                        className={formErrors.last_name ? 'border-red-500' : ''}
                      />
                      {formErrors.last_name && (
                        <p className="text-sm text-red-500">{formErrors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={accountData?.email || user.email || ''}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <p className="text-sm text-gray-500">
                      Email cannot be changed. Contact support if you need to update your email.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className={formErrors.phone ? 'border-red-500' : ''}
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleFormChange('role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="realtor">Realtor</SelectItem>
                        <SelectItem value="lender">Lender</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveAccount} 
                      disabled={isSaving || !hasFormChanges}
                      className="min-w-[120px]"
                    >
                      {isSaving ? 'Saving...' : hasFormChanges ? 'Save Changes' : 'No Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Credits Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyIcon className="h-5 w-5" />
                    Credits Overview
                  </CardTitle>
                  <CardDescription>
                    Your current credit balance and usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {creditBalance?.availableCredits || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Available Credits
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Account
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Manage your payment methods for credit purchases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showPaymentForm ? (
                    <PaymentMethodForm
                      onSuccess={handlePaymentMethodSuccess}
                      onCancel={handlePaymentMethodCancel}
                    />
                  ) : (
                    <>
                      {paymentMethods.length === 0 ? (
                        <div className="text-center py-8">
                          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No payment methods
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Add a payment method to purchase credits
                          </p>
                          <Button 
                            onClick={handleAddPaymentMethod}
                            className="flex items-center gap-2"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Add Payment Method
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                  <CreditCardIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {method.brand.toUpperCase()} •••• {method.last4}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Expires {method.exp_month}/{method.exp_year}
                                  </p>
                                </div>
                                {method.is_default && (
                                  <Badge variant="default" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {!method.is_default && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                  >
                                    Set Default
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePaymentMethod(method.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button 
                            onClick={handleAddPaymentMethod}
                            variant="outline"
                            className="w-full flex items-center gap-2"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Add Another Payment Method
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Your recent credit purchases and transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {billingHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">
                        No billing history available yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {billingHistory.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.type === 'credit' || transaction.type === 'purchase' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.type === 'credit' || transaction.type === 'purchase' ? (
                                <CheckIcon className="h-4 w-4" />
                              ) : (
                                <XMarkIcon className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(transaction.date).toLocaleDateString()} • {transaction.displayType}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.amount > 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {transaction.displayAmount} credits
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {transaction.creditType}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your password is managed by Supabase Auth. To change your password, please sign out and use the "Forgot Password" option on the login page.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Two-factor authentication is not yet available. This feature will be added in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellIcon className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Notification settings coming soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We're working on notification preferences. This feature will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
