'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Badge } from '@/features/shared/components/ui/badge';

// Form validation schema
const sellFormSchema = z.object({
  // Pin selection (required)
  selectedPin: z.string().min(1, 'Please select a property pin'),
  
  // Property details
  propertyType: z.enum(['single-family', 'multi-family', 'condo', 'townhouse', 'land', 'commercial']),
  estimatedValue: z.string().min(1, 'Estimated value is required'),
  desiredPrice: z.string().min(1, 'Desired price is required'),
  timeline: z.enum(['asap', '1-3months', '3-6months', '6-12months', 'flexible']),
  
  // Sell intent type and agent info
  intentType: z.enum(['fsbo', 'agent', 'wholesale']),
  agentName: z.string().optional(),
  agentCompany: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().optional(),
  
  // Additional information
  propertyCondition: z.string().optional(),
  reasonForSelling: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type SellFormData = z.infer<typeof sellFormSchema>;

const propertyTypes = [
  { value: 'single-family', label: 'Single Family' },
  { value: 'multi-family', label: 'Multi-Family' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
];

const timelineOptions = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-3months', label: '1-3 Months' },
  { value: '3-6months', label: '3-6 Months' },
  { value: '6-12months', label: '6-12 Months' },
  { value: 'flexible', label: 'Flexible' },
];

const intentTypes = [
  { 
    value: 'fsbo', 
    label: 'For Sale By Owner (FSBO)', 
    description: 'Selling without a real estate agent' 
  },
  { 
    value: 'agent', 
    label: 'Agent Listed', 
    description: 'Selling with a real estate agent' 
  },
  { 
    value: 'wholesale', 
    label: 'Wholesale', 
    description: 'Selling to investors or wholesalers' 
  },
];

interface Intent {
  id: string;
  intent_type: string;
  pin_id?: string;
  city?: string;
  state?: string;
  budget_min?: number;
  budget_max?: number;
  property_type?: string;
  timeline: string;
  created_at: string;
}

interface Pin {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  property_type?: string;
  estimated_value?: number;
}

export default function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'intents'>('submit');
  const [userPins, setUserPins] = useState<Pin[]>([]);
  const [userIntents, setUserIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPinDetails, setSelectedPinDetails] = useState<Pin | null>(null);
  
  const form = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      propertyType: 'single-family',
      timeline: 'flexible',
      intentType: 'fsbo',
    },
  });

  // Watch intent type to conditionally show agent fields
  const intentType = form.watch('intentType');
  const selectedPin = form.watch('selectedPin');

  useEffect(() => {
    if (user && !authLoading) {
      loadUserPins();
      loadUserIntents();
    }
  }, [user, authLoading]);

  // Update selected pin details when pin selection changes
  useEffect(() => {
    if (selectedPin) {
      const pin = userPins.find(p => p.id === selectedPin);
      setSelectedPinDetails(pin || null);
    } else {
      setSelectedPinDetails(null);
    }
  }, [selectedPin, userPins]);

  const loadUserPins = async () => {
    try {
      const response = await fetch('/api/pins');
      if (response.ok) {
        const pins = await response.json();
        setUserPins(pins);
      }
    } catch (error) {
      console.error('Error loading pins:', error);
    }
  };

  const loadUserIntents = async () => {
    try {
      const response = await fetch('/api/intents');
      if (response.ok) {
        const intents = await response.json();
        setUserIntents(intents.filter((intent: Intent) => intent.intent_type === 'sell'));
      }
    } catch (error) {
      console.error('Error loading intents:', error);
    }
  };

  const handleSubmit = async (data: SellFormData) => {
    if (!selectedPinDetails) {
      alert('Please select a property pin');
      return;
    }

    setLoading(true);
    
    try {
      const intentData = {
        intent_type: 'sell',
        pin_id: data.selectedPin,
        property_type: data.propertyType,
        budget_min: data.estimatedValue ? parseInt(data.estimatedValue) : undefined,
        budget_max: data.desiredPrice ? parseInt(data.desiredPrice) : undefined,
        timeline: data.timeline,
        // Additional sell-specific data
        intent_type_detail: data.intentType,
        agent_name: data.agentName,
        agent_company: data.agentCompany,
        agent_phone: data.agentPhone,
        agent_email: data.agentEmail,
        property_condition: data.propertyCondition,
        reason_for_selling: data.reasonForSelling,
        additional_notes: data.additionalNotes,
      };

      const response = await fetch('/api/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intentData)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        
        // Reset form
        form.reset();
        form.setValue('propertyType', 'single-family');
        form.setValue('timeline', 'flexible');
        form.setValue('intentType', 'fsbo');
        setSelectedPinDetails(null);
        
        // Refresh intents
        await loadUserIntents();
      } else {
        const error = await response.json();
        alert(`Failed to create intent: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating intent:', error);
      alert('Failed to create intent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLocationDisplay = (intent: Intent) => {
    if (intent.pin_id) {
      const pin = userPins.find(p => p.id === intent.pin_id);
      return pin ? `${pin.address}, ${pin.city}, ${pin.state}` : 'Property Pin';
    }
    return 'City Level';
  };

  if (authLoading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <div className="w-8 h-8 text-blue-600">🏠</div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Sell Your Property</h1>
                <p className="text-lg text-gray-600 mt-2">List your property and connect with qualified buyers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 text-blue-600">📍</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Pin-Specific Listing</h3>
                <p className="text-sm text-gray-600">List your exact property from your saved pins</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 text-blue-600">🏢</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Selling Options</h3>
                <p className="text-sm text-gray-600">FSBO, agent-assisted, or wholesale</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 text-blue-600">🔍</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Qualified Buyer Matching</h3>
                <p className="text-sm text-gray-600">Connect with buyers who match your criteria</p>
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
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  List New Property
                </button>
                <button
                  onClick={() => setActiveTab('intents')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'intents'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Listings ({userIntents.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {activeTab === 'submit' ? (
            <div className="space-y-8">
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                
                {/* Property Selection Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-5 h-5 text-blue-600">📍</div>
                      Select Property to Sell
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Choose a property from your saved pins. You can only sell specific properties, not entire areas.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="selectedPin" className="block text-sm font-medium text-gray-700 mb-2">
                        Property Pin *
                      </label>
                      <select
                        id="selectedPin"
                        {...form.register('selectedPin')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a property pin...</option>
                        {userPins.map((pin) => (
                          <option key={pin.id} value={pin.id}>
                            {pin.address}, {pin.city}, {pin.state}
                          </option>
                        ))}
                      </select>
                      {form.formState.errors.selectedPin && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.selectedPin.message}</p>
                      )}
                    </div>

                    {/* Selected Pin Details */}
                    {selectedPinDetails && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Selected Property Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-700">Address:</span>
                            <div className="text-blue-600">{selectedPinDetails.address}</div>
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">Location:</span>
                            <div className="text-blue-600">{selectedPinDetails.city}, {selectedPinDetails.state}</div>
                          </div>
                          {selectedPinDetails.property_type && (
                            <div>
                              <span className="font-medium text-blue-700">Type:</span>
                              <div className="text-blue-600 capitalize">{selectedPinDetails.property_type.replace('-', ' ')}</div>
                            </div>
                          )}
                          {selectedPinDetails.estimated_value && (
                            <div>
                              <span className="font-medium text-blue-700">Estimated Value:</span>
                              <div className="text-blue-600">${selectedPinDetails.estimated_value.toLocaleString()}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {userPins.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-5 h-5 text-yellow-600 mr-2">📍</div>
                          <div className="text-yellow-800">
                            <p className="font-medium">No property pins found</p>
                            <p className="text-sm">You need to save property pins before you can list them for sale.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Selling Method Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-5 h-5 text-blue-600">🏢</div>
                      How Do You Want to Sell?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {intentTypes.map((type) => (
                        <div
                          key={type.value}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            intentType === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => form.setValue('intentType', type.value as 'fsbo' | 'agent' | 'wholesale')}
                        >
                          <input
                            type="radio"
                            id={type.value}
                            {...form.register('intentType')}
                            value={type.value}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                              intentType === type.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {intentType === type.value && <div className="w-5 h-5">✓</div>}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{type.label}</h4>
                            <p className="text-xs text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Agent Information Fields (conditional) */}
                    {intentType === 'agent' && (
                      <div className="border-t pt-4 space-y-4">
                        <h4 className="font-medium text-gray-900">Agent Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-2">
                              Agent Name
                            </label>
                            <Input
                              id="agentName"
                              {...form.register('agentName')}
                              placeholder="Agent's full name"
                            />
                          </div>
                          <div>
                            <label htmlFor="agentCompany" className="block text-sm font-medium text-gray-700 mb-2">
                              Agent Company
                            </label>
                            <Input
                              id="agentCompany"
                              {...form.register('agentCompany')}
                              placeholder="Real estate company"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="agentPhone" className="block text-sm font-medium text-gray-700 mb-2">
                              Agent Phone
                            </label>
                            <Input
                              id="agentPhone"
                              {...form.register('agentPhone')}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div>
                            <label htmlFor="agentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                              Agent Email
                            </label>
                            <Input
                              id="agentEmail"
                              {...form.register('agentEmail')}
                              placeholder="agent@company.com"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Property Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-5 h-5 text-blue-600">🏠</div>
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                          Property Type *
                        </label>
                        <select
                          id="propertyType"
                          {...form.register('propertyType')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {propertyTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                          Timeline *
                        </label>
                        <select
                          id="timeline"
                          {...form.register('timeline')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {timelineOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Property Value *
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</div>
                          <Input
                            id="estimatedValue"
                            {...form.register('estimatedValue')}
                            type="number"
                            placeholder="250000"
                            className="pl-8"
                          />
                        </div>
                        {form.formState.errors.estimatedValue && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.estimatedValue.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="desiredPrice" className="block text-sm font-medium text-gray-700 mb-2">
                          Desired Sale Price *
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</div>
                          <Input
                            id="desiredPrice"
                            {...form.register('desiredPrice')}
                            type="number"
                            placeholder="275000"
                            className="pl-8"
                          />
                        </div>
                        {form.formState.errors.desiredPrice && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.desiredPrice.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="propertyCondition" className="block text-sm font-medium text-gray-700 mb-2">
                          Property Condition (Optional)
                        </label>
                        <Input
                          id="propertyCondition"
                          {...form.register('propertyCondition')}
                          placeholder="e.g., Move-in ready, needs updates"
                        />
                      </div>
                      <div>
                        <label htmlFor="reasonForSelling" className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Selling (Optional)
                        </label>
                        <Input
                          id="reasonForSelling"
                          {...form.register('reasonForSelling')}
                          placeholder="e.g., Relocating, downsizing"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        id="additionalNotes"
                        {...form.register('additionalNotes')}
                        placeholder="Any additional information about your property or selling situation..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="text-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
                    disabled={loading || userPins.length === 0}
                  >
                    {loading ? 'Submitting...' : 'List Property for Sale'}
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Your property will be listed and matched with qualified buyers.
                  </p>
                </div>
              </form>

              {/* Success State */}
              {showSuccess && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
                  
                  {/* Success Overlay */}
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 ease-out">
                      <div className="p-8 text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <div className="w-10 h-10 text-blue-600">✓</div>
                        </div>
                        
                        {/* Success Title */}
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                          Property Listed Successfully!
                        </h2>
                        
                        {/* Success Message */}
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                          Your property has been listed and will be matched with qualified buyers. Our team will contact you with potential matches.
                        </p>
                        
                        {/* Success Details */}
                        <div className="space-y-4 mb-8">
                          <div className="flex items-center justify-center gap-3 text-blue-700">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <div className="w-4 h-4 text-blue-600">✓</div>
                            </div>
                            <span className="font-medium">Your listing is now active</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-blue-700">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <div className="w-4 h-4 text-blue-600">✓</div>
                            </div>
                            <span className="font-medium">Buyers will be matched based on your criteria</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-blue-700">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <div className="w-4 h-4 text-blue-600">✓</div>
                            </div>
                            <span className="font-medium">You'll receive notifications about potential matches</span>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            onClick={() => setShowSuccess(false)}
                            size="lg"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          >
                            List Another Property
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowSuccess(false);
                              setActiveTab('intents');
                            }}
                            variant="outline" 
                            size="lg"
                            className="px-8 py-3 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                          >
                            View My Listings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Intents View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Property Listings</h2>
                <Button onClick={loadUserIntents} variant="outline" className="flex items-center gap-2">
                  <div className="w-4 h-4">🔄</div>
                  Refresh
                </Button>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-blue-600 mr-2">✓</div>
                    <span className="text-blue-800 font-medium">
                      New property listing submitted successfully! Your listing is now active.
                    </span>
                  </div>
                </div>
              )}

              {userIntents.length > 0 ? (
                <div className="space-y-4">
                  {userIntents.map((intent) => (
                    <Card key={intent.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {getLocationDisplay(intent)}
                              </h3>
                              <Badge className="bg-blue-100 text-blue-800">
                                {intent.intent_type}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {intent.property_type && (
                                <div>
                                  <span className="font-medium text-gray-700">Property Type:</span>
                                  <div className="text-gray-600 capitalize">
                                    {intent.property_type.replace('-', ' ')}
                                  </div>
                                </div>
                              )}
                              
                              {intent.budget_min && (
                                <div>
                                  <span className="font-medium text-gray-700">Estimated Value:</span>
                                  <div className="text-gray-600">
                                    ${intent.budget_min.toLocaleString()}
                                  </div>
                                </div>
                              )}
                              
                              {intent.budget_max && (
                                <div>
                                  <span className="font-medium text-gray-700">Desired Price:</span>
                                  <div className="text-gray-600">
                                    ${intent.budget_max.toLocaleString()}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <span className="font-medium text-gray-700">Timeline:</span>
                                <div className="text-gray-600 capitalize">
                                  {intent.timeline.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Listed:</span>
                                <div className="text-gray-600">
                                  {new Date(intent.created_at).toLocaleDateString()}
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
                  <div className="w-16 h-16 text-gray-400 mx-auto mb-4">🏠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No property listings yet</h3>
                  <p className="text-gray-500 mb-4">
                    List your first property to start connecting with qualified buyers.
                  </p>
                  <Button onClick={() => setActiveTab('submit')} variant="outline">
                    List a Property
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
