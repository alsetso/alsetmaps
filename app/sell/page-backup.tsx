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
import { PinsService } from '@/features/property-management/services/pins-service';

// Form validation schema
const sellFormSchema = z.object({
  // Pin selection (required)
  selectedPin: z.string().min(1, 'Please select a property pin'),
  
  // Property details
  propertyType: z.enum(['single-family', 'multi-family', 'condo', 'townhouse', 'land', 'commercial']),
  listingPrice: z.string().min(1, 'Listing price is required'),
  timeline: z.enum(['asap', '1-3months', '3-6months', '6-12months', 'flexible']),
  
  // Selling method
  forSaleBy: z.enum(['owner', 'agent', 'wholesaler']),
  
  // Images
  images: z.array(z.string().url()).default([]),
  
  // Contact info
  contactPhone: z.string().min(10, 'Valid phone number is required'),
  contactEmail: z.string().email('Valid email is required'),
  preferredContactMethod: z.enum(['email', 'phone', 'both']).default('email'),
  
  // Agent info (conditional)
  agentName: z.string().optional(),
  agentCompany: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().optional(),
}).refine((data) => {
  // If agent, require agent info
  if (data.forSaleBy === 'agent') {
    return data.agentName && data.agentCompany && data.agentPhone && data.agentEmail;
  }
  return true;
}, {
  message: "Agent information is required when listing with an agent",
  path: ["agentName"]
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

const forSaleByOptions = [
  { 
    value: 'owner', 
    label: 'For Sale By Owner (FSBO)', 
    description: 'Selling without a real estate agent' 
  },
  { 
    value: 'agent', 
    label: 'Listed with Agent', 
    description: 'Selling with a real estate agent' 
  },
  { 
    value: 'wholesaler', 
    label: 'Wholesale', 
    description: 'Selling to investors or wholesalers' 
  },
];

interface Listing {
  id: string;
  pin_id: string;
  listing_price: number;
  property_type: string;
  timeline: string;
  for_sale_by: string;
  status: string;
  created_at: string;
  agent_name?: string;
  agent_company?: string;
  agent_phone?: string;
  agent_email?: string;
  pins?: {
    name: string;
    search_history?: {
      search_address: string;
    };
  };
}

interface Pin {
  id: string;
  user_id: string;
  search_history_id?: string;
  latitude: number;
  longitude: number;
  name: string;
  images?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export default function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'listings'>('submit');
  const [userPins, setUserPins] = useState<Pin[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPinDetails, setSelectedPinDetails] = useState<Pin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pinsLoading, setPinsLoading] = useState(false);
  
  const form = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      propertyType: 'single-family',
      timeline: 'flexible',
      forSaleBy: 'owner',
      images: [],
      preferredContactMethod: 'email',
    },
  });

  // Watch forSaleBy to conditionally show agent fields
  const forSaleBy = form.watch('forSaleBy');
  const selectedPin = form.watch('selectedPin');

  useEffect(() => {
    if (user && !authLoading) {
      loadUserPins();
      loadUserListings();
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
    setPinsLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading pins for user:', user?.id, user?.email);
      
      const result = await PinsService.getUserPins();
      console.log('📌 PinsService result:', result);
      
      if (result.success && result.pins) {
        setUserPins(result.pins);
        setError(null);
        console.log('✅ Pins loaded successfully:', result.pins.length);
      } else {
        setError(result.error || 'Failed to load pins');
        console.log('❌ Failed to load pins:', result.error);
      }
    } catch (error) {
      console.error('❌ Error in loadUserPins:', error);
      setError(error instanceof Error ? error.message : 'Failed to load pins');
    } finally {
      setPinsLoading(false);
    }
  };

  const loadUserListings = async () => {
    try {
      const response = await fetch('/api/for-sale');
      if (response.ok) {
        const data = await response.json();
        setUserListings(data.listings || []);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const handleSubmit = async (data: SellFormData) => {
    if (!selectedPinDetails) {
      setError('Please select a property to list');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Prepare contact info
      const contactInfo: any = {
        phone: data.contactPhone,
        email: data.contactEmail,
        preferred_method: data.preferredContactMethod
      };

      // Add agent info if applicable
      if (data.forSaleBy === 'agent') {
        contactInfo.agent_name = data.agentName;
        contactInfo.agent_company = data.agentCompany;
        contactInfo.agent_phone = data.agentPhone;
        contactInfo.agent_email = data.agentEmail;
      }

      const listingData = {
        pin_id: data.selectedPin,
        listing_price: data.listingPrice,
        property_type: data.propertyType,
        timeline: data.timeline,
        for_sale_by: data.forSaleBy,
        images: data.images,
        contact_info: contactInfo,
        agent_name: data.agentName,
        agent_company: data.agentCompany,
        agent_phone: data.agentPhone,
        agent_email: data.agentEmail
      };

      const response = await fetch('/api/for-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        
        // Reset form
        form.reset();
        form.setValue('propertyType', 'single-family');
        form.setValue('timeline', 'flexible');
        form.setValue('forSaleBy', 'owner');
        form.setValue('images', []);
        form.setValue('preferredContactMethod', 'email');
        setSelectedPinDetails(null);
        
        // Refresh listings
        await loadUserListings();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to create listing. Please try again.');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLocationDisplay = (listing: Listing) => {
    if (listing.pin_id) {
      const pin = userPins.find(p => p.id === listing.pin_id);
      return pin?.name || 'Property Pin';
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
                  onClick={() => setActiveTab('listings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'listings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Listings ({userListings.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {activeTab === 'submit' ? (
            <div className="space-y-8">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-red-600 mr-3">⚠️</div>
                    <div>
                      <h4 className="font-medium text-red-900">Error</h4>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Success Display */}
              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-green-600 mr-3">✅</div>
                    <div>
                      <h4 className="font-medium text-green-900">Listing Created Successfully!</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Your property is now live and visible to potential buyers.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="ml-auto text-green-400 hover:text-green-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Debug Information Section */}
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 text-gray-600">🐛</div>
                    Debug Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">User Status:</span>
                      <div className="text-gray-600">
                        {user ? `✅ Logged in (${user.email})` : '❌ Not logged in'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Auth Loading:</span>
                      <div className="text-gray-600">
                        {authLoading ? '⏳ Loading...' : '✅ Complete'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Pins Loading:</span>
                      <div className="text-gray-600">
                        {pinsLoading ? '⏳ Loading...' : '✅ Complete'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Pins Count:</span>
                      <div className="text-gray-600">
                        {userPins.length} properties found
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Error:</span>
                      <div className="text-gray-600">
                        {error || 'None'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">User ID:</span>
                      <div className="text-gray-600 font-mono text-xs">
                        {user?.id || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Session Token:</span>
                      <div className="text-gray-600 font-mono text-xs">
                        {user ? 'Present' : 'Missing'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 space-x-4">
                    <button
                      type="button"
                      onClick={loadUserPins}
                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      🔄 Refresh Pins Data
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        console.log('🧪 Testing PinsService directly...');
                        try {
                          const result = await PinsService.getUserPins();
                          console.log('🧪 PinsService test result:', result);
                        } catch (error) {
                          console.error('🧪 PinsService test error:', error);
                        }
                      }}
                      className="text-green-600 hover:text-green-800 text-xs underline"
                    >
                      🧪 Test PinsService Directly
                    </button>
                  </div>
                </CardContent>
              </Card>

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
                        Choose Your Property *
                      </label>
                      {pinsLoading ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                          <span className="text-gray-600">Loading your properties...</span>
                        </div>
                      ) : (
                        <select
                          id="selectedPin"
                          {...form.register('selectedPin')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a property to list...</option>
                                                  {userPins.map((pin) => (
                          <option key={pin.id} value={pin.id}>
                            {pin.name || `Property ${pin.id.slice(0, 8)}`}
                          </option>
                        ))}
                        </select>
                      )}
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
                            <span className="font-medium text-blue-700">Property Name:</span>
                            <div className="text-blue-600">
                              {selectedPinDetails.name || 'Untitled Property'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">Coordinates:</span>
                            <div className="text-blue-600">
                              {selectedPinDetails.latitude.toFixed(6)}, {selectedPinDetails.longitude.toFixed(6)}
                            </div>
                          </div>
                          {selectedPinDetails.notes && (
                            <div>
                              <span className="font-medium text-blue-700">Notes:</span>
                              <div className="text-blue-600">{selectedPinDetails.notes}</div>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-blue-700">Created:</span>
                            <div className="text-blue-600">
                              {new Date(selectedPinDetails.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {userPins.length === 0 && !pinsLoading && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="w-6 h-6 text-blue-600">🏠</div>
                        </div>
                        <h4 className="font-medium text-blue-900 mb-2">No Properties Saved Yet</h4>
                        <p className="text-blue-700 text-sm mb-4">
                          To list a property for sale, you first need to save it from our property search.
                        </p>
                        <div className="space-y-2">
                          <a
                            href="/"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                          >
                            Search Properties
                          </a>
                          <p className="text-xs text-blue-600">
                            Find properties → Save as pins → List for sale
                          </p>
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
                      How Are You Selling?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {forSaleByOptions.map((type) => (
                        <div
                          key={type.value}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            forSaleBy === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => form.setValue('forSaleBy', type.value as 'owner' | 'agent' | 'wholesaler')}
                        >
                          <input
                            type="radio"
                            id={type.value}
                            {...form.register('forSaleBy')}
                            value={type.value}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                              forSaleBy === type.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {forSaleBy === type.value && <div className="w-5 h-5">✓</div>}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{type.label}</h4>
                            <p className="text-xs text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Agent Information Fields (conditional) */}
                    {forSaleBy === 'agent' && (
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

                    <div>
                      <label htmlFor="listingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                        Listing Price *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</div>
                        <Input
                          id="listingPrice"
                          {...form.register('listingPrice')}
                          type="number"
                          placeholder="275000"
                          className="pl-8"
                        />
                      </div>
                      {form.formState.errors.listingPrice && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.listingPrice.message}</p>
                      )}
                    </div>

                  </CardContent>
                </Card>

                {/* Contact Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-5 h-5 text-blue-600">📞</div>
                      Contact Information
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      How should potential buyers contact you?
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <Input
                          id="contactPhone"
                          {...form.register('contactPhone')}
                          placeholder="(555) 123-4567"
                          className="mt-1"
                        />
                        {form.formState.errors.contactPhone && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactPhone.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="contactEmail"
                          {...form.register('contactEmail')}
                          type="email"
                          placeholder="your@email.com"
                          className="mt-1"
                        />
                        {form.formState.errors.contactEmail && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactEmail.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Contact Method
                      </label>
                      <select
                        id="preferredContactMethod"
                        {...form.register('preferredContactMethod')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="text-center space-y-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={loading || userPins.length === 0 || pinsLoading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Listing...
                      </div>
                    ) : (
                      'List Property for Sale'
                    )}
                  </Button>
                  {userPins.length === 0 && !pinsLoading ? (
                    <p className="text-sm text-gray-500">
                      Save properties first to list them for sale
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Your property will be listed and matched with qualified buyers.
                    </p>
                  )}
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
                              setActiveTab('listings');
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
                <Button onClick={loadUserListings} variant="outline" className="flex items-center gap-2">
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

              {userListings.length > 0 ? (
                <div className="space-y-4">
                  {userListings.map((listing) => (
                    <Card key={listing.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {listing.pins?.name || 'Property Listing'}
                              </h3>
                              <Badge className="bg-green-100 text-green-800">
                                {listing.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Property Type:</span>
                                <div className="text-gray-600 capitalize">
                                  {listing.property_type.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Listing Price:</span>
                                <div className="text-gray-600 font-semibold">
                                  ${listing.listing_price.toLocaleString()}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Selling Method:</span>
                                <div className="text-gray-600 capitalize">
                                  {listing.for_sale_by.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Timeline:</span>
                                <div className="text-gray-600 capitalize">
                                  {listing.timeline.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Listed:</span>
                                <div className="text-gray-600">
                                  {new Date(listing.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            
                            {/* Agent Information (if applicable) */}
                            {listing.for_sale_by === 'agent' && listing.agent_name && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Agent Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Agent:</span>
                                    <div className="text-gray-600">{listing.agent_name}</div>
                                  </div>
                                  {listing.agent_company && (
                                    <div>
                                      <span className="font-medium text-gray-700">Company:</span>
                                      <div className="text-gray-600">{listing.agent_company}</div>
                                    </div>
                                  )}
                                  {listing.agent_phone && (
                                    <div>
                                      <span className="font-medium text-gray-700">Phone:</span>
                                      <div className="text-gray-600">{listing.agent_phone}</div>
                                    </div>
                                  )}
                                  {listing.agent_email && (
                                    <div>
                                      <span className="font-medium text-gray-700">Email:</span>
                                      <div className="text-gray-600">{listing.agent_email}</div>
                                    </div>
                                  )}
                                </div>
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
