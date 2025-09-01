'use client';

import { useState, useEffect } from 'react';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/features/shared/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  HomeIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  SellIntentData, 
  IntentTypeOption, 
  PropertyTypeOption, 
  TimelineOption 
} from '@/features/marketplace-intents/types/sell-intent';
import { SellTableService } from '@/features/marketplace-intents/services/sell-table-service';
import { AddressAutocompleteInput } from '@/features/marketplace-intents/components/AddressAutocompleteInput';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import type { AddressSuggestion } from '@/integrations/mapbox';

// Enhanced form validation schema
const sellFormSchema = z.object({
  propertyAddress: z.string().min(1, 'Property address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  intentType: z.enum(['fsbo', 'agent', 'wholesale']),
  propertyType: z.enum(['single-family', 'multi-family', 'condo', 'townhouse', 'land', 'commercial']),
  estimatedValue: z.string().min(1, 'Estimated value is required'),
  desiredPrice: z.string().min(1, 'Desired price is required'),
  timeline: z.enum(['asap', '1-3months', '3-6months', '6-12months', 'flexible']),
  agentName: z.string().optional(),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required'),
  contactEmail: z.string().email('Valid email is required'),
  additionalNotes: z.string().optional(),
});

const intentTypeOptions: IntentTypeOption[] = [
  { value: 'fsbo', label: 'For Sale By Owner', icon: UserIcon, description: 'Selling directly without an agent' },
  { value: 'agent', label: 'Listing by Agent', icon: BuildingOfficeIcon, description: 'Working with a real estate agent' },
  { value: 'wholesale', label: 'Wholesale Contract', icon: DocumentTextIcon, description: 'Assigning a purchase contract' },
];

const propertyTypeOptions: PropertyTypeOption[] = [
  { value: 'single-family', label: 'Single Family Home' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi-family', label: 'Multi-Family' },
  { value: 'land', label: 'Land/Lot' },
  { value: 'commercial', label: 'Commercial' },
];

const timelineOptions: TimelineOption[] = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-3months', label: '1-3 Months' },
  { value: '3-6months', label: '3-6 Months' },
  { value: '6-12months', label: '6-12 Months' },
  { value: 'flexible', label: 'Flexible' },
];

export default function SellPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [activeTab, setActiveTab] = useState<'submit' | 'records'>('submit');
  const [userRecords, setUserRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const form = useForm<SellIntentData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      intentType: 'fsbo',
      propertyType: 'single-family',
      timeline: 'flexible',
      contactName: user?.user_metadata?.full_name || '',
      contactEmail: user?.email || '',
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user && !authLoading) {
      form.setValue('contactName', user.user_metadata?.full_name || '');
      form.setValue('contactEmail', user.email || '');
    }
  }, [user, authLoading, form]);

  const handleAddressSelect = (address: AddressSuggestion) => {
    setSelectedAddress(address);
    const [longitude, latitude] = address.center;
    form.setValue('latitude', latitude);
    form.setValue('longitude', longitude);
  };

  // Fetch user's submitted records
  const fetchUserRecords = async () => {
    if (!user) return;
    
    setLoadingRecords(true);
    try {
      const records = await SellTableService.getUserSellIntents();
      setUserRecords(records);
    } catch (error) {
      console.error('Error fetching user records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Load user records when tab changes to records
  useEffect(() => {
    if (activeTab === 'records' && user) {
      fetchUserRecords();
    }
    // Clear success message when switching tabs
    setShowSuccessMessage(false);
  }, [activeTab, user]);

  const onSubmit = async (data: SellIntentData) => {
    setIsSubmitting(true);
    
    try {
      // Generate session ID for anonymous users
      let sessionId: string | undefined;
      let anonymousId: string | undefined;
      
      if (!user) {
        sessionId = SellTableService.generateSessionId();
        anonymousId = SellTableService.generateAnonymousId();
        
        // Store in localStorage for anonymous users to track their submissions
        localStorage.setItem('alset_session_id', sessionId);
        localStorage.setItem('alset_anonymous_id', anonymousId);
      }
      
      const result = await SellTableService.submitSellIntent(data, sessionId, anonymousId);
      
      if (result.success) {
        // If user is logged in, refresh their records and show success message
        if (user) {
          fetchUserRecords();
          setShowSuccessMessage(true);
          // Auto-hide success message after 5 seconds
          setTimeout(() => setShowSuccessMessage(false), 5000);
        }
        setSubmitted(true);
      } else {
        // TODO: Show error message to user
        console.error('Submission failed:', result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Submission Successful!</CardTitle>
              <CardDescription className="text-lg">
                Thank you for your interest in selling your property. Our team will review your information and contact you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setSubmitted(false)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Submit Another Property
              </Button>
            </CardContent>
          </Card>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        {/* Enhanced Header Section - Separated from form */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <HomeIcon className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Sell Your Property
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Whether you're selling by owner, working with an agent, or have a wholesale contract, 
                we're here to help you get the best value for your property.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Free property evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Expert market insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>24-hour response time</span>
                </div>
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
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Submit New Property
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'records'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Submissions ({userRecords.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {activeTab === 'submit' ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Property Information Section */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                    <MapPinIcon className="w-6 h-6 text-red-600" />
                    Property Information
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    Tell us about the property you want to sell. Start typing an address to get autocomplete suggestions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Address Autocomplete */}
                  <AddressAutocompleteInput onAddressSelect={handleAddressSelect} />
                  
                  {/* Address Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Property Type and Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <FormControl>
                            <select 
                              {...field}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              {propertyTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeline to Sell</FormLabel>
                          <FormControl>
                            <select 
                              {...field}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              {timelineOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Coordinates Display (if available) */}
                  {selectedAddress && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <MapPinIcon className="w-5 h-5" />
                        <span className="font-medium">Location Verified</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Coordinates: {selectedAddress.center[1].toFixed(6)}, {selectedAddress.center[0].toFixed(6)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Intent & Pricing Section */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                    Selling Intent & Pricing
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    How do you want to sell and what's your target price?
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="intentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">How do you want to sell?</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          {intentTypeOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <div
                                key={option.value}
                                className={`
                                  relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                                  ${field.value === option.value
                                    ? 'border-red-500 bg-red-50 shadow-md'
                                    : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                                  }
                                `}
                                onClick={() => field.onChange(option.value)}
                              >
                                <div className="flex flex-col items-center text-center space-y-2">
                                  <Icon className={`w-8 h-8 ${field.value === option.value ? 'text-red-600' : 'text-gray-500'}`} />
                                  <div>
                                    <div className="font-semibold text-gray-900">{option.label}</div>
                                    <div className="text-sm text-gray-600">{option.description}</div>
                                  </div>
                                </div>
                                {field.value === option.value && (
                                  <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Agent Name Input - Only show when "agent" is selected */}
                  {form.watch('intentType') === 'agent' && (
                    <FormField
                      control={form.control}
                      name="agentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your agent's name" {...field} />
                          </FormControl>
                          <FormMessage />
                          <div className="mt-2 text-sm">
                            <a 
                              href="/agents" 
                              className="text-blue-600 hover:text-blue-800 underline transition-colors"
                            >
                              I am the Agent
                            </a>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Market Value</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input 
                                placeholder="500,000" 
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="desiredPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Selling Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input 
                                placeholder="475,000" 
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Section */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                    <UserIcon className="w-6 h-6 text-green-600" />
                    Contact Information
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    {user ? 'Your contact information is pre-filled from your account. You can edit any field as needed.' : 'How can we reach you about your property?'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field}
                              className=""
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input 
                                placeholder="(555) 123-4567" 
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                              placeholder="john@example.com" 
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            placeholder="Tell us anything else about your property or situation..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Section */}
              <div className="text-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-md bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Property for Sale'
                  )}
                </Button>
                
                <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
                  By submitting this form, you agree to be contacted about your property. 
                  Your information is secure and will only be used to help you sell your property.
                </p>
              </div>
            </form>
          </Form>
        ) : (
          /* Records View */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  My Property Submissions
                </h2>
                <p className="text-gray-600">
                  View and track all your property selling submissions
                </p>
              </div>
              <Button
                onClick={fetchUserRecords}
                disabled={loadingRecords}
                variant="outline"
                className="ml-4"
              >
                {loadingRecords ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    New submission added successfully! Your property is now under review.
                  </span>
                </div>
              </div>
            )}

            {loadingRecords ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your submissions...</p>
              </div>
            ) : userRecords.length > 0 ? (
              <div className="space-y-4">
                {userRecords.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {record.property_address}
                          </CardTitle>
                          <CardDescription>
                            {record.city}, {record.state} {record.zip_code}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            record.status === 'approved' ? 'bg-green-100 text-green-800' :
                            record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            record.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Property Type:</span>
                          <span className="ml-2 text-gray-600">{record.property_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Intent Type:</span>
                          <span className="ml-2 text-gray-600">{record.intent_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Estimated Value:</span>
                          <span className="ml-2 text-gray-600">${record.estimated_value}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Desired Price:</span>
                          <span className="ml-2 text-gray-600">${record.desired_price}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Timeline:</span>
                          <span className="ml-2 text-gray-600">{record.timeline}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Submitted:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(record.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {record.additional_notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="font-medium text-gray-700">Additional Notes:</span>
                          <p className="text-gray-600 mt-1">{record.additional_notes}</p>
                        </div>
                      )}

                      {record.review_notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="font-medium text-gray-700">Review Notes:</span>
                          <p className="text-gray-600 mt-1">{record.review_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No submissions yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any properties for sale yet. Start by submitting your first property.
                </p>
                <Button
                  onClick={() => setActiveTab('submit')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Submit Your First Property
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
