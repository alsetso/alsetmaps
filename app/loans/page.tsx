'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { LoansTableService, type LoanRecord } from '@/features/marketplace-intents/services/loans-table-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Badge } from '@/features/shared/components/ui/badge';
import { 
  HomeIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  StarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

// Form validation schema
const loanFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  grossMonthlyIncome: z.string().min(1, 'Monthly income is required'),
  employmentStatus: z.enum(['employed', 'self-employed', 'retired', 'unemployed']),
  yearsEmployed: z.string().min(1, 'Years employed is required'),
  creditScoreRange: z.enum(['excellent', 'good', 'fair', 'poor']),
  downPayment: z.string().min(1, 'Down payment is required'),
  propertyPrice: z.string().min(1, 'Property price is required'),
  propertyUse: z.enum(['primary-residence', 'investment', 'second-home']),
  loanType: z.enum(['conventional', 'fha', 'va', 'usda', 'jumbo', 'investment', 'refinance']),
  additionalIncome: z.string().optional(),
  otherAssets: z.string().optional(),
  monthlyDebts: z.string().optional(),
  creditCheckConsent: z.boolean().refine(val => val === true, 'Credit check consent is required'),
  preApprovalConsent: z.boolean().refine(val => val === true, 'Pre-approval consent is required'),
  marketingConsent: z.boolean().default(false),
});

type LoanFormData = z.infer<typeof loanFormSchema>;

const loanTypes = [
  { value: 'conventional', label: 'Conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'usda', label: 'USDA' },
  { value: 'jumbo', label: 'Jumbo' },
  { value: 'investment', label: 'Investment' },
  { value: 'refinance', label: 'Refinance' },
];

const propertyUses = [
  { value: 'primary-residence', label: 'Primary Residence' },
  { value: 'investment', label: 'Investment Property' },
  { value: 'second-home', label: 'Second Home' },
];

const employmentStatuses = [
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
];

const creditScoreRanges = [
  { value: 'excellent', label: 'Excellent (750+)', color: 'text-green-600' },
  { value: 'good', label: 'Good (700-749)', color: 'text-blue-600' },
  { value: 'fair', label: 'Fair (650-699)', color: 'text-yellow-600' },
  { value: 'poor', label: 'Poor (Below 650)', color: 'text-red-600' },
];

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'records'>('submit');
  const [userRecords, setUserRecords] = useState<LoanRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { user, loading: authLoading } = useAuth();

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      employmentStatus: 'employed',
      yearsEmployed: '2',
      creditScoreRange: 'good',
      propertyUse: 'primary-residence',
      loanType: 'conventional',
      creditCheckConsent: false,
      preApprovalConsent: false,
      marketingConsent: false,
    },
  });

  // Load user records when switching to records tab
  useEffect(() => {
    if (activeTab === 'records' && user) {
      fetchUserRecords();
    }
    // Clear success message when switching tabs
    setShowSuccessMessage(false);
  }, [activeTab, user]);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user && !authLoading) {
      form.setValue('firstName', user.user_metadata?.full_name?.split(' ')[0] || '');
      form.setValue('lastName', user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '');
      form.setValue('email', user.email || '');
    }
  }, [user, authLoading, form]);

  const fetchUserRecords = async () => {
    if (!user) return;
    
    setLoadingRecords(true);
    try {
      const records = await LoansTableService.getUserLoanApplications();
      setUserRecords(records);
    } catch (error) {
      console.error('Error fetching user records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    try {
      // Convert form data to PreQualificationData format
      const preQualData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        grossMonthlyIncome: parseInt(data.grossMonthlyIncome),
        employmentStatus: data.employmentStatus,
        yearsEmployed: parseInt(data.yearsEmployed),
        creditScoreRange: data.creditScoreRange,
        downPayment: parseInt(data.downPayment),
        propertyPrice: parseInt(data.propertyPrice),
        propertyUse: data.propertyUse,
        loanType: data.loanType,
        additionalIncome: data.additionalIncome ? parseInt(data.additionalIncome) : undefined,
        otherAssets: data.otherAssets ? parseInt(data.otherAssets) : undefined,
        monthlyDebts: data.monthlyDebts ? parseInt(data.monthlyDebts) : undefined,
      };

      const response = await LoansTableService.submitLoanApplication(preQualData);

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
        form.setValue('employmentStatus', 'employed');
        form.setValue('yearsEmployed', '2');
        form.setValue('creditScoreRange', 'good');
        form.setValue('propertyUse', 'primary-residence');
        form.setValue('loanType', 'conventional');
        form.setValue('creditCheckConsent', false);
        form.setValue('preApprovalConsent', false);
        form.setValue('marketingConsent', false);
      } else {
        console.error('Submission failed:', response.message);
      }
    } catch (error) {
      console.error('Error submitting loan application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'pre-approved': { color: 'bg-blue-100 text-blue-800', label: 'Pre-Approved' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      contacted: { color: 'bg-purple-100 text-purple-800', label: 'Contacted' },
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Get Your Best Loan Rate</h1>
                <p className="text-lg text-gray-600 mt-2">Pre-approval in minutes, not days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Compliant</h3>
                <p className="text-sm text-gray-600">Bank-level security with full compliance</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast Pre-Approval</h3>
                <p className="text-sm text-gray-600">Get your pre-approval letter in minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Best Rates</h3>
                <p className="text-sm text-gray-600">Access to competitive rates from top lenders</p>
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
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Submit New Application
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'records'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Applications ({userRecords.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {activeTab === 'submit' ? (
            <div className="space-y-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information Card */}
                <Card>
                  <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HomeIcon className="w-5 h-5 text-green-600" />
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
                                    <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                    <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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

              {/* Financial Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grossMonthlyIncome">Gross Monthly Income *</Label>
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
                      {form.formState.errors.grossMonthlyIncome && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.grossMonthlyIncome.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="employmentStatus">Employment Status *</Label>
                                  <select 
                        id="employmentStatus"
                        {...form.register('employmentStatus')}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  >
                                    {employmentStatuses.map((status) => (
                                      <option key={status.value} value={status.value}>
                                        {status.label}
                                      </option>
                                    ))}
                                  </select>
                      {form.formState.errors.employmentStatus && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.employmentStatus.message}</p>
                            )}
                    </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearsEmployed">Years Employed *</Label>
                                  <Input 
                        id="yearsEmployed"
                        {...form.register('yearsEmployed')}
                                    type="number" 
                                    placeholder="2" 
                        className="mt-1"
                      />
                      {form.formState.errors.yearsEmployed && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.yearsEmployed.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="creditScoreRange">Credit Score Range *</Label>
                                  <select 
                        id="creditScoreRange"
                        {...form.register('creditScoreRange')}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  >
                                    {creditScoreRanges.map((range) => (
                                      <option key={range.value} value={range.value}>
                                        {range.label}
                                      </option>
                                    ))}
                                  </select>
                      {form.formState.errors.creditScoreRange && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.creditScoreRange.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="additionalIncome">Additional Income (Optional)</Label>
                      <div className="relative mt-1">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="additionalIncome"
                          {...form.register('additionalIncome')}
                          type="number"
                          placeholder="0"
                          className="pl-10"
                          />
                        </div>
                    </div>
                    <div>
                      <Label htmlFor="otherAssets">Other Assets (Optional)</Label>
                      <div className="relative mt-1">
                                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input 
                          id="otherAssets"
                          {...form.register('otherAssets')}
                                      type="number" 
                          placeholder="0"
                                      className="pl-10"
                                    />
                                  </div>
                    </div>
                    <div>
                      <Label htmlFor="monthlyDebts">Monthly Debts (Optional)</Label>
                      <div className="relative mt-1">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="monthlyDebts"
                          {...form.register('monthlyDebts')}
                          type="number"
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyPrice">Property Price *</Label>
                      <div className="relative mt-1">
                                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input 
                          id="propertyPrice"
                          {...form.register('propertyPrice')}
                                      type="number" 
                                      placeholder="250000" 
                                      className="pl-10"
                                    />
                                  </div>
                      {form.formState.errors.propertyPrice && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.propertyPrice.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="downPayment">Down Payment *</Label>
                      <div className="relative mt-1">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="downPayment"
                          {...form.register('downPayment')}
                          type="number"
                          placeholder="50000"
                          className="pl-10"
                        />
                      </div>
                      {form.formState.errors.downPayment && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.downPayment.message}</p>
                      )}
                    </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyUse">Property Use *</Label>
                                  <select 
                        id="propertyUse"
                        {...form.register('propertyUse')}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  >
                                    {propertyUses.map((use) => (
                                      <option key={use.value} value={use.value}>
                                        {use.label}
                                      </option>
                                    ))}
                                  </select>
                      {form.formState.errors.propertyUse && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.propertyUse.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="loanType">Loan Type *</Label>
                                  <select 
                        id="loanType"
                        {...form.register('loanType')}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  >
                                    {loanTypes.map((type) => (
                                      <option key={type.value} value={type.value}>
                                        {type.label}
                                      </option>
                                    ))}
                                  </select>
                      {form.formState.errors.loanType && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.loanType.message}</p>
                      )}
                                  </div>
                        </div>
                  </CardContent>
                </Card>
              
              {/* Compliance & Permissions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HomeIcon className="w-5 h-5 text-orange-600" />
                    Compliance & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="creditCheckConsent"
                        {...form.register('creditCheckConsent')}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <Label htmlFor="creditCheckConsent" className="text-sm cursor-pointer">
                        I authorize a credit check for loan pre-approval purposes *
                      </Label>
                        </div>
                    {form.formState.errors.creditCheckConsent && (
                      <p className="text-red-500 text-sm">{form.formState.errors.creditCheckConsent.message}</p>
                    )}

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="preApprovalConsent"
                        {...form.register('preApprovalConsent')}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <Label htmlFor="preApprovalConsent" className="text-sm cursor-pointer">
                        I consent to receive pre-approval information and loan offers *
                      </Label>
                        </div>
                    {form.formState.errors.preApprovalConsent && (
                      <p className="text-red-500 text-sm">{form.formState.errors.preApprovalConsent.message}</p>
                    )}

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="marketingConsent"
                        {...form.register('marketingConsent')}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <Label htmlFor="marketingConsent" className="text-sm cursor-pointer">
                        I consent to receive marketing communications (optional)
                      </Label>
                        </div>
                      </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <HomeIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Your information is secure and compliant</p>
                        <p>We follow all federal regulations including FCRA, GLBA, and ECOA. Your data is encrypted and protected.</p>
                      </div>
                  </div>
                  </div>
                </CardContent>
              </Card>

                             {/* Submit Button */}
                    <div className="text-center">
                      <Button
                   type="submit" 
                   size="lg" 
                   className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                 >
                   {isSubmitting ? 'Submitting...' : 'Submit Loan Application'}
                 </Button>
                 <p className="text-sm text-gray-600 mt-2">
                   Our loan team will review your application and contact you within 24 hours.
                 </p>
               </div>
             </form>

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
                       <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                         <CheckCircleIcon className="w-10 h-10 text-green-600" />
                       </div>
                       
                       {/* Success Title */}
                       <h2 className="text-3xl font-bold text-gray-900 mb-4">
                         Application Submitted Successfully!
                       </h2>
                       
                       {/* Success Message */}
                       <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                         Thank you for your loan application. Our team will review your information and contact you within 24 hours.
                       </p>
                       
                       {/* Success Details */}
                       <div className="space-y-4 mb-8">
                         <div className="flex items-center justify-center gap-3 text-green-700">
                           <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                             <CheckCircleIcon className="w-4 h-4 text-green-600" />
                           </div>
                           <span className="font-medium">Your application is now under review</span>
                         </div>
                         <div className="flex items-center justify-center gap-3 text-green-700">
                           <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                             <CheckCircleIcon className="w-4 h-4 text-green-600" />
                           </div>
                           <span className="font-medium">You'll receive a confirmation email shortly</span>
                         </div>
                         <div className="flex items-center justify-center gap-3 text-green-700">
                           <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                             <CheckCircleIcon className="w-4 h-4 text-green-600" />
                           </div>
                           <span className="font-medium">A loan officer will contact you within 24 hours</span>
                         </div>
                       </div>
                       
                       {/* Action Buttons */}
                       <div className="flex flex-col sm:flex-row gap-3 justify-center">
                         <Button 
                           onClick={() => setSubmitted(false)}
                           size="lg"
                           className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold"
                         >
                           Submit Another Application
                         </Button>
                         <Button 
                           onClick={() => {
                             setSubmitted(false);
                             setActiveTab('records');
                           }}
                           variant="outline" 
                           size="lg"
                           className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                         >
                           View My Applications
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
                <h2 className="text-2xl font-bold text-gray-900">My Loan Applications</h2>
                <Button onClick={fetchUserRecords} variant="outline" className="flex items-center gap-2">
                  <HomeIcon className="w-4 h-4" />
                  Refresh
                      </Button>
              </div>

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      New loan application submitted successfully! Your application is now under review.
                    </span>
                  </div>
                </div>
              )}

              {loadingRecords ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your applications...</p>
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
                                <span className="font-medium text-gray-700">Loan Type:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.loan_type.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Property Use:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.property_use.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Property Price:</span>
                                <div className="text-gray-600">
                                  ${record.property_price.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Down Payment:</span>
                                <div className="text-gray-600">
                                  ${record.down_payment.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Loan Amount:</span>
                                <div className="text-gray-600">
                                  ${record.loan_amount.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Monthly Income:</span>
                                <div className="text-gray-600">
                                  ${record.gross_monthly_income.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Credit Score:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.credit_score_range}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Employment:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.employment_status.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Submitted:</span>
                                <div className="text-gray-600">
                                  {new Date(record.created_at).toLocaleDateString()}
                                </div>

                              </div>

                            </div>
                            
                            {record.pre_approval_amount && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                  <span className="font-medium text-green-800">Pre-Approval Amount</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  ${record.pre_approval_amount.toLocaleString()}
                                </div>
                                {record.estimated_rate && (
                                  <div className="text-sm text-green-700">
                                    Estimated Rate: {record.estimated_rate}%
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                    </div>
                  </CardContent>
                </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-500 mb-4">
                    Submit your first loan application to get started with pre-approval.
                  </p>
                  <Button onClick={() => setActiveTab('submit')} variant="outline">
                    Submit New Application
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
