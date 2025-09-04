"use client";

import { useState, useEffect } from 'react';
import { AccountSetupService } from '@/features/authentication/services/account-setup-service';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Label } from '@/features/shared/components/ui/label';

interface OnboardingState {
  stage: 'role-selection' | 'account-details' | 'credits-claim';
  isLoading: boolean;
  accountId: string | null;
  selectedRole: string | null;
  userDetails: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  error: string | null;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const ROLE_OPTIONS = [
  { id: 'seller', label: 'Seller', description: 'Selling your property' },
  { id: 'buyer', label: 'Buyer', description: 'Looking to purchase property' },
  { id: 'investor', label: 'Investor', description: 'Property investment focus' },
  { id: 'wholesaler', label: 'Wholesaler', description: 'Property wholesaling' },
  { id: 'realtor', label: 'Realtor', description: 'Licensed real estate agent' },
  { id: 'lender', label: 'Lender', description: 'Mortgage and financing' }
];

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [state, setState] = useState<OnboardingState>({
    stage: 'role-selection',
    isLoading: false,
    accountId: null,
    selectedRole: null,
    userDetails: {
      first_name: '',
      last_name: '',
      phone: ''
    },
    error: null
  });

  useEffect(() => {
    if (isOpen) {
      checkAccountStatus();
    }
  }, [isOpen]);

  const checkAccountStatus = async () => {
    const status = await AccountSetupService.checkAccountStatus();
    if (status.hasAccount && status.hasCredits) {
      onComplete();
    } else if (status.hasAccount && !status.hasCredits && status.accountId) {
      setState(prev => ({ ...prev, stage: 'credits-claim', accountId: status.accountId || null }));
    }
  };

  const handleRoleSelect = (role: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedRole: role,
      stage: 'account-details',
      error: null 
    }));
  };

  const handleAccountSubmit = async () => {
    // Validate required fields
    if (!state.userDetails.first_name.trim() || !state.userDetails.last_name.trim()) {
      setState(prev => ({ 
        ...prev, 
        error: 'First name and last name are required' 
      }));
      return;
    }

    if (!state.selectedRole) {
      setState(prev => ({ 
        ...prev, 
        error: 'Please select a role' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await AccountSetupService.setupAccountAndCredits({ 
        role: state.selectedRole as any,
        first_name: state.userDetails.first_name,
        last_name: state.userDetails.last_name,
        phone: state.userDetails.phone
      });
      
      if (result.success && result.accountId) {
        setState(prev => ({ 
          ...prev, 
          stage: 'credits-claim',
          accountId: result.accountId || null,
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to setup account', 
          isLoading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'An unexpected error occurred', 
        isLoading: false 
      }));
    }
  };

  const handleClaimCredits = async () => {
    if (!state.accountId) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await AccountSetupService.createCreditsOnly(state.accountId);
      
      if (result.success) {
        onComplete();
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to create credits', 
          isLoading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'An unexpected error occurred', 
        isLoading: false 
      }));
    }
  };

  const goBackToRoleSelection = () => {
    setState(prev => ({ 
      ...prev, 
      stage: 'role-selection',
      error: null 
    }));
  };

  const goBackToAccountDetails = () => {
    setState(prev => ({ 
      ...prev, 
      stage: 'account-details',
      error: null 
    }));
  };

  const updateUserDetails = (field: keyof typeof state.userDetails, value: string) => {
    setState(prev => ({
      ...prev,
      userDetails: {
        ...prev.userDetails,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg">
        {state.stage === 'role-selection' && (
          <Card className="w-full shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Select Your Role
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Choose how you'll be using Alset
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{state.error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                {ROLE_OPTIONS.map((role) => (
                  <Button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full h-16 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 justify-start px-4"
                    variant="outline"
                  >
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {state.stage === 'account-details' && (
          <Card className="w-full shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Complete Your Profile
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Set up your account to access property search features
              </p>
              {state.selectedRole && (
                <div className="mt-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {ROLE_OPTIONS.find(r => r.id === state.selectedRole)?.label}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{state.error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    value={state.userDetails.first_name}
                    onChange={(e) => updateUserDetails('first_name', e.target.value)}
                    placeholder="Enter first name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    value={state.userDetails.last_name}
                    onChange={(e) => updateUserDetails('last_name', e.target.value)}
                    placeholder="Enter last name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={state.userDetails.phone}
                  onChange={(e) => updateUserDetails('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleAccountSubmit}
                  disabled={state.isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0"
                  variant="default"
                >
                  {state.isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                <Button
                  onClick={goBackToRoleSelection}
                  disabled={state.isLoading}
                  className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
                  variant="outline"
                >
                  Back to Role Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {state.stage === 'credits-claim' && (
          <Card className="w-full shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Account Created Successfully!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Claim your smart search credits to get started
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{state.error}</p>
                </div>
              )}
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm leading-relaxed">
                  Your account has been created successfully! Basic property searches are always free. Smart searches provide enhanced insights and detailed analysis for 1 credit per search.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={handleClaimCredits}
                  disabled={state.isLoading}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 border-0"
                  size="lg"
                >
                  {state.isLoading ? 'Claiming Credits...' : 'Claim 10 Smart Search Credits'}
                </Button>
                
                <Button
                  onClick={goBackToAccountDetails}
                  disabled={state.isLoading}
                  className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
                  variant="outline"
                >
                  Back to Account Details
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  You can always purchase additional credits later
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
