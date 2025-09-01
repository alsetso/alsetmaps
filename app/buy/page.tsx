'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { BuyTableService, type BuyRecord } from '@/features/marketplace-intents/services/buy-table-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Badge } from '@/features/shared/components/ui/badge';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  HomeIcon, 
  StarIcon,
  BellIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Simplified form schema matching the simplified buy table
const buyFormSchema = z.object({
  contactName: z.string().min(2, 'Name must be at least 2 characters'),
  contactEmail: z.string().email('Please enter a valid email'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  
  // Primary Intent
  intentType: z.enum(['personal', 'investment']),
  
  // Location Preferences
  cities: z.array(z.string()).min(1, 'Please select at least one city'),
  state: z.string().min(2, 'Please select a state'),
  
  // Budget
  minBudget: z.string().optional(),
  maxBudget: z.string().min(1, 'Please enter your maximum budget'),
  
  // Property Criteria
  propertyTypes: z.array(z.string()).min(1, 'Please select at least one property type'),
  minBeds: z.string().optional(),
  maxBeds: z.string().optional(),
  minBaths: z.string().optional(),
  maxBaths: z.string().optional(),
  
  // Timeline
  timeline: z.enum(['asap', '1-3months', '3-6months', '6-12months', 'flexible']),
  
  // Agent Preference
  agentPreference: z.enum(['working-with-agent', 'no-agent', 'need-agent-referral', 'open-to-agent']),
  
  // Additional Notes
  additionalNotes: z.string().optional(),
});

type BuyFormData = z.infer<typeof buyFormSchema>;

const propertyTypeOptions = [
  { value: 'single-family', label: 'Single Family Home' },
  { value: 'multi-family', label: 'Multi-Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'investment', label: 'Investment Property' },
  { value: 'fixer-upper', label: 'Fixer Upper' },
  { value: 'new-construction', label: 'New Construction' },
];

const timelineOptions = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-3months', label: '1-3 Months' },
  { value: '3-6months', label: '3-6 Months' },
  { value: '6-12months', label: '6-12 Months' },
  { value: 'flexible', label: 'Flexible' },
];

const agentPreferenceOptions = [
  { value: 'working-with-agent', label: 'Working with Agent' },
  { value: 'no-agent', label: 'No Agent' },
  { value: 'need-agent-referral', label: 'Need Agent Referral' },
  { value: 'open-to-agent', label: 'Open to Agent' },
];

export default function BuyPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'records'>('submit');
  const [userRecords, setUserRecords] = useState<BuyRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  
  const { user, loading: authLoading } = useAuth();

  const form = useForm<BuyFormData>({
    resolver: zodResolver(buyFormSchema),
    defaultValues: {
      contactName: user?.user_metadata?.full_name || '',
      contactEmail: user?.email || '',
      contactPhone: '',
      intentType: 'personal',
      cities: [],
      state: '',
      minBudget: '',
      maxBudget: '',
      propertyTypes: [],
      timeline: 'flexible',
      agentPreference: 'open-to-agent',
      additionalNotes: '',
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user && !authLoading) {
      form.setValue('contactName', user.user_metadata?.full_name || '');
      form.setValue('contactEmail', user.email || '');
    }
  }, [user, authLoading, form]);

  // Load user records when switching to records tab
  useEffect(() => {
    if (activeTab === 'records' && user) {
      fetchUserRecords();
    }
    // Clear success message when switching tabs
    setShowSuccessMessage(false);
  }, [activeTab, user]);

  const fetchUserRecords = async () => {
    if (!user) return;
    
    setLoadingRecords(true);
    try {
      const records = await BuyTableService.getUserBuyIntents();
      setUserRecords(records);
    } catch (error) {
      console.error('Error fetching user records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const onSubmit = async (data: BuyFormData) => {
    try {
      // Generate session/anonymous IDs for non-logged-in users
      let sessionId: string | undefined;
      let anonymousId: string | undefined;
      
      if (!user) {
        sessionId = BuyTableService.generateSessionId();
        anonymousId = BuyTableService.generateAnonymousId();
        
        // Store in localStorage for anonymous users
        localStorage.setItem('buySessionId', sessionId);
        localStorage.setItem('buyAnonymousId', anonymousId);
      }

      // Convert form data to BuyerIntentData format
      const buyerIntentData = {
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        locationPreference: {
          city: data.cities[0] || '',
          state: data.state,
        },
        propertyCriteria: {
          propertyType: data.propertyTypes as any, // Type assertion for compatibility
          condition: ['move-in-ready'] as any, // Type assertion for compatibility
          minBeds: data.minBeds ? parseInt(data.minBeds) : undefined,
          maxBeds: data.maxBeds ? parseInt(data.maxBeds) : undefined,
          minBaths: data.minBaths ? parseInt(data.minBaths) : undefined,
          maxBaths: data.maxBaths ? parseInt(data.maxBaths) : undefined,
        },
        financialCriteria: {
          maxPrice: parseInt(data.maxBudget),
          minPrice: data.minBudget ? parseInt(data.minBudget) : undefined,
          financingType: ['conventional'] as any, // Default financing type
        },
        timeline: data.timeline,
        agentPreference: data.agentPreference,
        investmentStrategy: (data.intentType === 'personal' ? 'primary-residence' : 'rental-income') as any,
        mustHaves: [],
        dealBreakers: [],
        additionalNotes: data.additionalNotes,
        searchRadius: 25,
        emailAlerts: true,
        smsAlerts: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await BuyTableService.submitBuyIntent(
        buyerIntentData,
        sessionId,
        anonymousId
      );

      if (response.success) {
        // Refresh user records if logged in
        if (user) {
          await fetchUserRecords();
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 5000);
        }
        
        // Reset form
        form.reset();
        setSelectedCities([]);
        setSelectedPropertyTypes([]);
      } else {
        // Show error message in a more user-friendly way
        console.error('Submission failed:', response.message);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit buy intent. Please try again.');
    }
  };

  const addCity = () => {
    const cityInput = document.getElementById('cityInput') as HTMLInputElement;
    const city = cityInput?.value?.trim();
    if (city && !selectedCities.includes(city)) {
      const newCities = [...selectedCities, city];
      setSelectedCities(newCities);
      form.setValue('cities', newCities);
      cityInput.value = '';
    }
  };

  const removeCity = (cityToRemove: string) => {
    const newCities = selectedCities.filter(city => city !== cityToRemove);
    setSelectedCities(newCities);
    form.setValue('cities', newCities);
  };

  const togglePropertyType = (propertyType: string) => {
    const newTypes = selectedPropertyTypes.includes(propertyType)
      ? selectedPropertyTypes.filter(type => type !== propertyType)
      : [...selectedPropertyTypes, propertyType];
    
    setSelectedPropertyTypes(newTypes);
    form.setValue('propertyTypes', newTypes);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Contacted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <HomeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <StarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Perfect Property
              </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Submit your buying criteria and let us match you with the perfect properties. 
              Our team will review your requirements and connect you with relevant opportunities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Personal or Investment</h3>
                <p className="text-sm text-gray-600">Specify your buying intent</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Location Preferences</h3>
                <p className="text-sm text-gray-600">Choose cities and areas</p>
            </div>

              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Budget & Criteria</h3>
                <p className="text-sm text-gray-600">Set your price range and must-haves</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Only for logged-in users */}
        {user && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('submit')} 
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'submit' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Submit New Form
                </button>
                <button 
                  onClick={() => setActiveTab('records')} 
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'records' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Submissions ({userRecords.length})
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-12">
          {activeTab === 'submit' ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName">Full Name *</Label>
                      <Input
                        id="contactName"
                        {...form.register('contactName')}
                        className={form.formState.errors.contactName ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.contactName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="contactPhone">Phone Number *</Label>
                      <Input
                        id="contactPhone"
                        {...form.register('contactPhone')}
                        placeholder="(555) 123-4567"
                        className={form.formState.errors.contactPhone ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.contactPhone && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactPhone.message}</p>
                      )}
                    </div>
                </div>

                  <div>
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...form.register('contactEmail')}
                      className={form.formState.errors.contactEmail ? 'border-red-500' : ''}
                    />
                    {form.formState.errors.contactEmail && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactEmail.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Buying Intent Card */}
                  <Card>
                    <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-green-600" />
                    Buying Intent
                      </CardTitle>
                    </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>What type of buyer are you? *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {[
                        { value: 'personal', label: 'Personal Use', description: 'Primary residence, vacation home, etc.' },
                        { value: 'investment', label: 'Investment', description: 'Rental income, flip, development, etc.' }
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            form.watch('intentType') === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => form.setValue('intentType', option.value as 'personal' | 'investment')}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.intentType && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.intentType.message}</p>
                    )}
                      </div>
                </CardContent>
              </Card>

              {/* Location Preferences Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-purple-600" />
                    Location Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cityInput">Cities of Interest *</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="cityInput"
                        placeholder="Enter city name"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                      />
                      <Button type="button" onClick={addCity} variant="outline">
                        Add City
                      </Button>
                      </div>
                    
                    {selectedCities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedCities.map((city) => (
                          <Badge key={city} variant="secondary" className="flex items-center gap-1">
                            {city}
                            <button
                              type="button"
                              onClick={() => removeCity(city)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {form.formState.errors.cities && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.cities.message}</p>
                    )}
                      </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <select 
                      id="state"
                      onChange={(e) => form.setValue('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a state</option>
                      {[
                        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
                      ].map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.state && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.state.message}</p>
                    )}
                      </div>
                    </CardContent>
                  </Card>

              {/* Budget Card */}
                    <Card>
                      <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    Budget
                        </CardTitle>
                      </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minBudget">Minimum Budget (Optional)</Label>
                      <Input
                        id="minBudget"
                        {...form.register('minBudget')}
                        placeholder="$200,000"
                        type="number"
                        min="0"
                      />
                          </div>
                    
                    <div>
                      <Label htmlFor="maxBudget">Maximum Budget *</Label>
                      <Input
                        id="maxBudget"
                        {...form.register('maxBudget')}
                        placeholder="$500,000"
                        type="number"
                        min="0"
                        className={form.formState.errors.maxBudget ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.maxBudget && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.maxBudget.message}</p>
                      )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

              {/* Property Criteria Card */}
                  <Card>
                    <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HomeIcon className="w-5 h-5 text-blue-600" />
                    Property Criteria
                      </CardTitle>
                    </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Property Types *</Label>
                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                       {propertyTypeOptions.map((option) => (
                         <div key={option.value} className="flex items-center space-x-2">
                           <input
                             type="checkbox"
                             id={option.value}
                             checked={selectedPropertyTypes.includes(option.value)}
                             onChange={() => togglePropertyType(option.value)}
                             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                           />
                           <Label htmlFor={option.value} className="text-sm cursor-pointer">
                             {option.label}
                           </Label>
                         </div>
                       ))}
                     </div>
                    {form.formState.errors.propertyTypes && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.propertyTypes.message}</p>
                    )}
                  </div>
                  
                                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div>
                       <Label htmlFor="minBeds">Min Beds</Label>
                       <select 
                         id="minBeds"
                         onChange={(e) => form.setValue('minBeds', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       >
                         <option value="">Any</option>
                         {[1, 2, 3, 4, 5, 6].map((beds) => (
                           <option key={beds} value={beds.toString()}>
                             {beds}+
                           </option>
                         ))}
                       </select>
                     </div>
                     
                     <div>
                       <Label htmlFor="maxBeds">Max Beds</Label>
                       <select 
                         id="maxBeds"
                         onChange={(e) => form.setValue('maxBeds', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       >
                         <option value="">Any</option>
                         {[1, 2, 3, 4, 5, 6].map((beds) => (
                           <option key={beds} value={beds.toString()}>
                             {beds}
                           </option>
                         ))}
                       </select>
                      </div>
                     
                     <div>
                       <Label htmlFor="minBaths">Min Baths</Label>
                       <select 
                         id="minBaths"
                         onChange={(e) => form.setValue('minBaths', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       >
                         <option value="">Any</option>
                         {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((baths) => (
                           <option key={baths} value={baths.toString()}>
                             {baths}+
                           </option>
                         ))}
                       </select>
                      </div>
                     
                     <div>
                       <Label htmlFor="maxBaths">Max Baths</Label>
                       <select 
                         id="maxBaths"
                         onChange={(e) => form.setValue('maxBaths', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       >
                         <option value="">Any</option>
                         {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((baths) => (
                           <option key={baths} value={baths.toString()}>
                             {baths}
                           </option>
                         ))}
                       </select>
                      </div>
                      </div>
                    </CardContent>
                  </Card>

              {/* Timeline & Agent Preference Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-purple-600" />
                    Timeline & Agent Preference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="timeline">Timeline *</Label>
                    <select 
                      id="timeline"
                      onChange={(e) => form.setValue('timeline', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select timeline</option>
                      {timelineOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.timeline && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.timeline.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="agentPreference">Agent Preference *</Label>
                    <select 
                      id="agentPreference"
                      onChange={(e) => form.setValue('agentPreference', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select agent preference</option>
                      {agentPreferenceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.agentPreference && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.agentPreference.message}</p>
                    )}
                </div>
                </CardContent>
              </Card>

              {/* Additional Notes Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-orange-600" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="additionalNotes">Any additional requirements or preferences?</Label>
                  <textarea
                    id="additionalNotes"
                    {...form.register('additionalNotes')}
                    placeholder="Tell us about any specific features, neighborhoods, schools, or other requirements..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="text-center">
                <Button type="submit" size="lg" className="px-8 py-3 text-lg">
                  Submit Buy Intent
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Our team will review your requirements and contact you within 24 hours.
                </p>
              </div>
            </form>
          ) : (
            /* Records View */
            <div className="space-y-6">
                          <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Buy Intent Submissions</h2>
              <Button onClick={fetchUserRecords} variant="outline" className="flex items-center gap-2">
                <ArrowPathIcon className="w-4 h-4" />
                Refresh
              </Button>
                </div>
                
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    New buy intent submitted successfully! Your submission is now under review.
                  </span>
                </div>
              </div>
            )}

              {loadingRecords ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your submissions...</p>
                </div>
              ) : userRecords.length === 0 ? (
                <div className="text-center py-12">
                  <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-500 mb-4">
                    Submit your first buy intent to get started with property matching.
                  </p>
                  <Button onClick={() => setActiveTab('submit')} variant="outline">
                    Submit New Intent
                  </Button>
                  </div>
              ) : (
                <div className="space-y-4">
                  {userRecords.map((record) => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {record.intent_type === 'personal' ? 'Personal Use' : 'Investment'} Property
                              </h3>
                              {getStatusBadge(record.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Location:</span>
                                <div className="text-gray-600">
                                  {record.cities.join(', ')}, {record.state}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Budget:</span>
                                <div className="text-gray-600">
                                  {record.min_budget ? `$${record.min_budget.toLocaleString()}` : 'No min'} - 
                                  ${record.max_budget.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Property Types:</span>
                                <div className="text-gray-600">
                                  {record.property_types.join(', ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Timeline:</span>
                                <div className="text-gray-600 capitalize">
                                  {record.timeline.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Agent Preference:</span>
                                <div className="text-gray-600">
                                  {record.agent_preference.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Submitted:</span>
                                <div className="text-gray-600">
                                  {new Date(record.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            
                            {record.additional_notes && (
                              <div className="mt-3">
                                <span className="font-medium text-gray-700">Notes:</span>
                                <div className="text-gray-600 mt-1">{record.additional_notes}</div>
                              </div>
                            )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                </div>
              )}


              </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
