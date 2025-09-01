'use client';

import { useState, useEffect } from 'react';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Badge } from '@/features/shared/components/ui/badge';
import { Form } from '@/features/shared/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { RefinanceTableService } from '@/features/marketplace-intents/services/refinance-table-service';
import { AddressAutocompleteInput } from '@/features/marketplace-intents/components/AddressAutocompleteInput';
import { 
  CurrencyDollarIcon,
  HomeIcon,
  ChartBarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Form validation schema
const refinanceSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  
  // Property Information
  propertyAddress: z.string().min(1, 'Property address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  currentPropertyValue: z.string().min(1, 'Property value is required'),
  
  // Current Loan Information
  currentLender: z.string().min(1, 'Current lender is required'),
  currentLoanBalance: z.string().min(1, 'Loan balance is required'),
  currentInterestRate: z.string().min(1, 'Interest rate is required'),
  currentMonthlyPayment: z.string().min(1, 'Monthly payment is required'),
  currentLoanTerm: z.string().min(1, 'Loan term is required'),
  currentLoanType: z.enum(['conventional', 'fha', 'va', 'usda', 'jumbo']),
  currentPmiAmount: z.string().optional(),
  
  // Refinance Goals
  refinanceType: z.enum(['rate-term', 'cash-out', 'debt-consolidation', 'streamline', 'fha-streamline', 'va-streamline']),
  primaryReason: z.enum(['lower-rate', 'lower-payment', 'cash-out', 'debt-consolidation', 'remove-pmi', 'change-term', 'investment']),
  cashOutAmount: z.string().optional(),
  
  // Financial Profile
  creditScoreRange: z.enum(['excellent', 'good', 'fair', 'poor']),
  grossMonthlyIncome: z.string().optional(),
  employmentStatus: z.enum(['employed', 'self-employed', 'retired', 'unemployed']).optional(),
  yearsEmployed: z.string().optional(),
  
  // Timeline
  timeline: z.enum(['asap', '1-3months', '3-6months', 'flexible']),
  urgencyReason: z.string().optional(),
  
  // Additional Information
  additionalNotes: z.string().optional(),
  specialCircumstances: z.string().optional(),
});

type RefinanceFormData = z.infer<typeof refinanceSchema>;

const loanTypes = [
  { value: 'conventional', label: 'Conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'usda', label: 'USDA' },
  { value: 'jumbo', label: 'Jumbo' },
];

const creditScoreRanges = [
  { value: 'excellent', label: 'Excellent (750+)' },
  { value: 'good', label: 'Good (700-749)' },
  { value: 'fair', label: 'Fair (650-699)' },
  { value: 'poor', label: 'Poor (Below 650)' },
];

const refinanceTypes = [
  { value: 'rate-term', label: 'Rate & Term' },
  { value: 'cash-out', label: 'Cash Out' },
  { value: 'debt-consolidation', label: 'Debt Consolidation' },
  { value: 'streamline', label: 'Streamline' },
  { value: 'fha-streamline', label: 'FHA Streamline' },
  { value: 'va-streamline', label: 'VA Streamline' },
];

const refinanceReasons = [
  { value: 'lower-rate', label: 'Lower Interest Rate' },
  { value: 'lower-payment', label: 'Lower Monthly Payment' },
  { value: 'cash-out', label: 'Cash Out Equity' },
  { value: 'debt-consolidation', label: 'Debt Consolidation' },
  { value: 'remove-pmi', label: 'Remove PMI' },
  { value: 'change-term', label: 'Change Loan Term' },
  { value: 'investment', label: 'Investment Purpose' },
];

const timelineOptions = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-3months', label: '1-3 Months' },
  { value: '3-6months', label: '3-6 Months' },
  { value: 'flexible', label: 'Flexible' },
];

const employmentStatuses = [
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
];

export default function RefinancePage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'records'>('submit');
  const [userRecords, setUserRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { user, loading: authLoading } = useAuth();

  const form = useForm<RefinanceFormData>({
    resolver: zodResolver(refinanceSchema),
    defaultValues: {
      currentLoanType: 'conventional',
      refinanceType: 'rate-term',
      primaryReason: 'lower-rate',
      creditScoreRange: 'good',
      timeline: 'flexible',
      employmentStatus: 'employed',
    },
  });

  // Pre-fill form for logged-in users
  useEffect(() => {
    if (user && !authLoading) {
      form.setValue('firstName', user.user_metadata?.full_name?.split(' ')[0] || '');
      form.setValue('lastName', user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '');
      form.setValue('email', user.email || '');
    }
  }, [user, authLoading, form]);

  // Fetch user records when records tab is active
  useEffect(() => {
    if (activeTab === 'records' && user) {
      fetchUserRecords();
    }
  }, [activeTab, user]);

  const fetchUserRecords = async () => {
    if (!user) return;
    
    setLoadingRecords(true);
    try {
      const records = await RefinanceTableService.getUserRefinanceRequests();
      setUserRecords(records);
    } catch (error) {
      console.error('Error fetching user records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const onSubmit = async (data: RefinanceFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate session/anonymous ID for non-logged-in users
      let sessionId: string | undefined;
      let anonymousId: string | undefined;
      
      if (!user) {
        sessionId = RefinanceTableService.generateSessionId();
        anonymousId = RefinanceTableService.generateAnonymousId();
        
        // Store in localStorage for anonymous users
        localStorage.setItem('refinance_session_id', sessionId);
        localStorage.setItem('refinance_anonymous_id', anonymousId);
      }

      // Transform form data to match service expectations
      const transformedData = {
        ...data,
        currentPropertyValue: parseInt(data.currentPropertyValue),
        currentLoanBalance: parseInt(data.currentLoanBalance),
        currentInterestRate: parseFloat(data.currentInterestRate),
        currentMonthlyPayment: parseInt(data.currentMonthlyPayment),
        currentLoanTerm: parseInt(data.currentLoanTerm),
        currentPmiAmount: data.currentPmiAmount ? parseInt(data.currentPmiAmount) : 0,
        cashOutAmount: data.cashOutAmount ? parseInt(data.cashOutAmount) : 0,
        grossMonthlyIncome: data.grossMonthlyIncome ? parseInt(data.grossMonthlyIncome) : undefined,
        yearsEmployed: data.yearsEmployed ? parseInt(data.yearsEmployed) : undefined,
      };

      const response = await RefinanceTableService.submitRefinanceRequest(
        transformedData as any,
        sessionId,
        anonymousId
      );

      if (response.success) {
        // Set success state
        setSubmitted(true);
        
        // Refresh user records if logged in
        if (user) {
          await fetchUserRecords();
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 5000);
        }
        
        // Reset form
        form.reset();
        form.setValue('currentLoanType', 'conventional');
        form.setValue('refinanceType', 'rate-term');
        form.setValue('primaryReason', 'lower-rate');
        form.setValue('creditScoreRange', 'good');
        form.setValue('timeline', 'flexible');
        form.setValue('employmentStatus', 'employed');
      } else {
        console.error('Submission failed:', response.message);
        alert(`Submission failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Error submitting refinance request:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      reviewing: { color: 'bg-blue-100 text-blue-800', label: 'Reviewing' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expired' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Refinance Your Mortgage</h1>
                <p className="text-lg text-gray-600 mt-2">Lower your rate, reduce your payment, or cash out equity</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalculatorIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Calculate Savings</h3>
                <p className="text-sm text-gray-600">See exactly how much you could save monthly and over time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Guidance</h3>
                <p className="text-sm text-gray-600">Get personalized advice from refinance specialists</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast Process</h3>
                <p className="text-sm text-gray-600">Streamlined application with quick approval</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Only show for logged-in users */}
        {user && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('submit')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'submit'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Submit New Request
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'records'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Requests ({userRecords.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {activeTab === 'submit' ? (
            <div className="space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PhoneIcon className="w-5 h-5 text-purple-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...form.register('firstName')}
                          placeholder="John"
                          className="mt-1"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...form.register('lastName')}
                          placeholder="Doe"
                          className="mt-1"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative mt-1">
                          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            {...form.register('email')}
                            placeholder="john@example.com"
                            className="pl-10"
                          />
                        </div>
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <div className="relative mt-1">
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="phone"
                            {...form.register('phone')}
                            placeholder="(555) 123-4567"
                            className="pl-10"
                          />
                        </div>
                        {form.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Property Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HomeIcon className="w-5 h-5 text-purple-600" />
                      Property Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                       <AddressAutocompleteInput 
                         onAddressSelect={(suggestion) => {
                           console.log('Address selected:', suggestion);
                           // The AddressAutocompleteInput will automatically populate city, state, zipCode
                           // We can also extract coordinates if needed for future use
                           if (suggestion.center) {
                             form.setValue('latitude', suggestion.center[1].toString());
                             form.setValue('longitude', suggestion.center[0].toString());
                           }
                         }}
                       />
                       {form.formState.errors.propertyAddress && (
                         <p className="text-red-500 text-sm mt-1">{form.formState.errors.propertyAddress.message}</p>
                       )}
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="city">City *</Label>
                         <Input
                           id="city"
                           {...form.register('city')}
                           placeholder="City"
                           className="mt-1"
                         />
                         {form.formState.errors.city && (
                           <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                         )}
                       </div>
                       <div>
                         <Label htmlFor="state">State *</Label>
                         <Input
                           id="state"
                           {...form.register('state')}
                           placeholder="State"
                           className="mt-1"
                         />
                         {form.formState.errors.state && (
                           <p className="text-red-500 text-sm mt-1">{form.formState.errors.state.message}</p>
                         )}
                       </div>
                     </div>
                     
                     <div>
                       <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
                       <Input
                         id="zipCode"
                         {...form.register('zipCode')}
                         placeholder="12345"
                         className="mt-1"
                       />
                     </div>
                    
                    <div>
                      <Label htmlFor="currentPropertyValue">Current Property Value *</Label>
                      <div className="relative mt-1">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="currentPropertyValue"
                          {...form.register('currentPropertyValue')}
                          type="number"
                          placeholder="250000"
                          className="pl-10"
                        />
                      </div>
                      {form.formState.errors.currentPropertyValue && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentPropertyValue.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Loan Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartBarIcon className="w-5 h-5 text-purple-600" />
                      Current Loan Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentLender">Current Lender *</Label>
                        <Input
                          id="currentLender"
                          {...form.register('currentLender')}
                          placeholder="Bank of America"
                          className="mt-1"
                        />
                        {form.formState.errors.currentLender && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentLender.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="currentLoanType">Current Loan Type *</Label>
                        <select
                          id="currentLoanType"
                          {...form.register('currentLoanType')}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {loanTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentLoanBalance">Current Loan Balance *</Label>
                        <div className="relative mt-1">
                          <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="currentLoanBalance"
                            {...form.register('currentLoanBalance')}
                            type="number"
                            placeholder="200000"
                            className="pl-10"
                          />
                        </div>
                        {form.formState.errors.currentLoanBalance && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentLoanBalance.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="currentInterestRate">Current Interest Rate (%) *</Label>
                        <Input
                          id="currentInterestRate"
                          {...form.register('currentInterestRate')}
                          type="number"
                          step="0.01"
                          placeholder="6.5"
                          className="mt-1"
                        />
                        {form.formState.errors.currentInterestRate && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentInterestRate.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentMonthlyPayment">Current Monthly Payment *</Label>
                        <div className="relative mt-1">
                          <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="currentMonthlyPayment"
                            {...form.register('currentMonthlyPayment')}
                            type="number"
                            placeholder="1264"
                            className="pl-10"
                          />
                        </div>
                        {form.formState.errors.currentMonthlyPayment && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentMonthlyPayment.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="currentLoanTerm">Current Loan Term (Years) *</Label>
                        <Input
                          id="currentLoanTerm"
                          {...form.register('currentLoanTerm')}
                          type="number"
                          placeholder="30"
                          className="mt-1"
                        />
                        {form.formState.errors.currentLoanTerm && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentLoanTerm.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="currentPmiAmount">Current PMI Amount (Optional)</Label>
                      <div className="relative mt-1">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="currentPmiAmount"
                          {...form.register('currentPmiAmount')}
                          type="number"
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Refinance Goals Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalculatorIcon className="w-5 h-5 text-purple-600" />
                      Refinance Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="refinanceType">Refinance Type *</Label>
                        <select
                          id="refinanceType"
                          {...form.register('refinanceType')}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {refinanceTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="primaryReason">Primary Reason *</Label>
                        <select
                          id="primaryReason"
                          {...form.register('primaryReason')}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {refinanceReasons.map((reason) => (
                            <option key={reason.value} value={reason.value}>
                              {reason.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cashOutAmount">Cash Out Amount (Optional)</Label>
                      <div className="relative mt-1">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="cashOutAmount"
                          {...form.register('cashOutAmount')}
                          type="number"
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                      Financial Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="creditScoreRange">Credit Score Range *</Label>
                        <select
                          id="creditScoreRange"
                          {...form.register('creditScoreRange')}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {creditScoreRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="employmentStatus">Employment Status</Label>
                        <select
                          id="employmentStatus"
                          {...form.register('employmentStatus')}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {employmentStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="grossMonthlyIncome">Gross Monthly Income (Optional)</Label>
                        <div className="relative mt-1">
                          <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="grossMonthlyIncome"
                            {...form.register('grossMonthlyIncome')}
                            type="number"
                            placeholder="5000"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="yearsEmployed">Years Employed (Optional)</Label>
                        <Input
                          id="yearsEmployed"
                          {...form.register('yearsEmployed')}
                          type="number"
                          placeholder="2"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline & Additional Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-purple-600" />
                      Timeline & Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeline">When do you want to refinance? *</Label>
                        <select
                          id="timeline"
                          {...form.register('timeline')}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {timelineOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="urgencyReason">Reason for Urgency (Optional)</Label>
                        <Input
                          id="urgencyReason"
                          {...form.register('urgencyReason')}
                          placeholder="e.g., Rate lock expiring"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                        <textarea
                          id="additionalNotes"
                          {...form.register('additionalNotes')}
                          placeholder="Any additional information about your refinance goals..."
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialCircumstances">Special Circumstances (Optional)</Label>
                        <textarea
                          id="specialCircumstances"
                          {...form.register('specialCircumstances')}
                          placeholder="Any special circumstances we should know about..."
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="text-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="px-8 py-3 text-lg bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Refinance Request'}
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Our refinance team will review your request and contact you within 24 hours.
                  </p>
                </div>
              </form>
                </Form>

              {/* Success State */}
              {submitted && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
                  
                  {/* Success Overlay */}
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 ease-out">
                      <div className="p-8 text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircleIcon className="w-10 h-10 text-purple-600" />
                        </div>
                        
                        {/* Success Title */}
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                          Refinance Request Submitted Successfully!
                        </h2>
                        
                        {/* Success Message */}
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                          Thank you for your refinance request. Our team will review your information and contact you within 24 hours.
                        </p>
                        
                        {/* Success Details */}
                        <div className="space-y-4 mb-8">
                          <div className="flex items-center justify-center gap-3 text-purple-700">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">Your request is now under review</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-purple-700">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">You'll receive a confirmation email shortly</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-purple-700">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">A refinance specialist will contact you within 24 hours</span>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            onClick={() => setSubmitted(false)}
                            size="lg"
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                          >
                            Submit Another Request
                          </Button>
                          <Button 
                            onClick={() => {
                              setSubmitted(false);
                              setActiveTab('records');
                            }}
                            variant="outline" 
                            size="lg"
                            className="px-8 py-3 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold"
                          >
                            View My Requests
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Records View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Refinance Requests</h2>
                <Button onClick={fetchUserRecords} variant="outline" className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-purple-800 font-medium">
                      New refinance request submitted successfully! Your request is now under review.
                    </span>
                  </div>
                </div>
              )}

              {loadingRecords ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your requests...</p>
                </div>
              ) : userRecords.length > 0 ? (
                <div className="space-y-4">
                  {userRecords.map((record) => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {record.first_name} {record.last_name}
                              </h3>
                              {getStatusBadge(record.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Refinance Type:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.refinance_type.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Primary Reason:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.primary_reason.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Current Rate:</span>
                                <div className="text-gray-600">
                                  {record.current_interest_rate}%
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Loan Balance:</span>
                                <div className="text-gray-600">
                                  ${record.current_loan_balance.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Monthly Payment:</span>
                                <div className="text-gray-600">
                                  ${record.current_monthly_payment.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Property Value:</span>
                                <div className="text-gray-600">
                                  ${record.current_property_value.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Credit Score:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.credit_score_range}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Timeline:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.timeline.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Submitted:</span>
                                <div className="text-gray-600">
                                  {new Date(record.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No refinance requests yet</h3>
                  <p className="text-gray-500 mb-4">
                    Submit your first refinance request to get started with potential savings.
                  </p>
                  <Button onClick={() => setActiveTab('submit')} variant="outline">
                    Submit New Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
