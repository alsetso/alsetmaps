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
  title: z.string().min(1, 'Listing title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  
  // Selling method
  forSaleBy: z.enum(['owner', 'agent', 'wholesaler']),
  
  // Images
  images: z.array(z.string()).default([]),
  
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
  user_id: string;
  pin_id: string;
  title: string;
  description: string;
  listing_price: number;
  property_type: string;
  timeline: string;
  for_sale_by: string;
  latitude: number;
  longitude: number;
  images: string[];
  contact_info: {
    phone: string;
    email: string;
    preferred_method: string;
    agent_name?: string;
    agent_company?: string;
    agent_phone?: string;
    agent_email?: string;
  };
  status: string;
  views_count: number;
  inquiries_count: number;
  listing_expires_at?: string;
  created_at: string;
  updated_at: string;
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

export default function SellPageStepper() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'listings'>('submit');
  const [userPins, setUserPins] = useState<Pin[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPinDetails, setSelectedPinDetails] = useState<Pin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pinsLoading, setPinsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Get pinId from URL params
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const pinIdFromUrl = searchParams.get('pinId');
  
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

  // Auto-select pin from URL parameter
  useEffect(() => {
    if (pinIdFromUrl && userPins.length > 0) {
      const pin = userPins.find(p => p.id === pinIdFromUrl);
      if (pin) {
        form.setValue('selectedPin', pinIdFromUrl);
        setSelectedPinDetails(pin);
      }
    }
  }, [pinIdFromUrl, userPins, form]);

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
        title: data.title,
        description: data.description,
        for_sale_by: data.forSaleBy,
        images: data.images,
        contact_info: contactInfo,
        agent_name: data.agentName,
        agent_company: data.agentCompany,
        agent_phone: data.agentPhone,
        agent_email: data.agentEmail
      };

      console.log('🚀 Submitting listing data:', listingData);
      console.log('🔐 Current user:', user?.id, user?.email);
      
      const response = await fetch('/api/for-sale', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
      });
      
      console.log('📡 API Response status:', response.status, response.statusText);

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
        setCurrentStep(1);
        
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

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedPin && selectedPinDetails;
      case 2:
        return form.watch('propertyType') && form.watch('listingPrice') && form.watch('timeline') && form.watch('title') && form.watch('description');
      case 3:
        return form.watch('forSaleBy') && form.watch('contactPhone') && form.watch('contactEmail');
      default:
        return false;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(file);
        newImageUrls.push(tempUrl);
      }
      
      setUploadedImages(prev => [...prev, ...newImageUrls]);
      form.setValue('images', [...form.getValues('images'), ...newImageUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    form.setValue('images', newImages);
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
        {/* Main Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-8">
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

              {/* Stepper Form Container */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
                  
                  {/* Stepper Header */}
                  <div className="bg-white border-b border-gray-200 px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">List Your Property</h2>
                      <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Step Indicators */}
                    <div className="flex justify-between mt-4">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            step <= currentStep 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {step}
                          </div>
                          <div className={`text-xs mt-1 ${
                            step <= currentStep ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {step === 1 ? 'Property' : step === 2 ? 'Details' : 'Contact'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-8">
                    
                    {/* Step 1: Property Selection */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Property</h3>
                          <p className="text-gray-600">Select a property from your saved pins to list for sale</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="selectedPin" className="block text-sm font-medium text-gray-700 mb-2">
                              Select Property *
                            </label>
                            {pinsLoading ? (
                              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                                <span className="text-gray-600">Loading your properties...</span>
                              </div>
                            ) : (
                              <select
                                id="selectedPin"
                                {...form.register('selectedPin')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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

                          {/* Property Preview */}
                          <div>
                            {selectedPinDetails ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-full">
                                <h4 className="font-medium text-blue-900 mb-3">Selected Property</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium text-blue-700">Name:</span>
                                    <div className="text-blue-600">{selectedPinDetails.name || 'Untitled Property'}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-700">Location:</span>
                                    <div className="text-blue-600">
                                      {selectedPinDetails.latitude.toFixed(4)}, {selectedPinDetails.longitude.toFixed(4)}
                                    </div>
                                  </div>
                                  {selectedPinDetails.notes && (
                                    <div>
                                      <span className="font-medium text-blue-700">Notes:</span>
                                      <div className="text-blue-600 text-xs">{selectedPinDetails.notes}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full flex items-center justify-center">
                                <p className="text-gray-500 text-sm">Select a property to see details</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {userPins.length === 0 && !pinsLoading && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <div className="w-6 h-6 text-blue-600">🏠</div>
                            </div>
                            <h4 className="font-medium text-blue-900 mb-2">No Properties Saved Yet</h4>
                            <p className="text-blue-700 text-sm mb-4">
                              To list a property for sale, you first need to save it from our property search.
                            </p>
                            <a
                              href="/"
                              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Search Properties
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                                         {/* Step 2: Property Details */}
                     {currentStep === 2 && (
                       <div className="space-y-6">
                         <div className="text-center mb-6">
                           <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Details</h3>
                           <p className="text-gray-600">Tell us about your property and pricing</p>
                         </div>
                         
                         {/* Title and Description */}
                         <div className="space-y-4">
                           <div>
                             <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                               Listing Title *
                             </label>
                             <Input
                               id="title"
                               {...form.register('title')}
                               placeholder="Beautiful 3-bedroom home in quiet neighborhood"
                               className="h-11"
                             />
                             {form.formState.errors.title && (
                               <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                             )}
                           </div>
                           
                           <div>
                             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                               Property Description *
                             </label>
                             <textarea
                               id="description"
                               {...form.register('description')}
                               rows={4}
                               placeholder="Describe your property, its features, location benefits, and what makes it special..."
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                             />
                             {form.formState.errors.description && (
                               <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                             )}
                           </div>
                         </div>
                         
                         {/* Property Type, Price, Timeline */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div>
                             <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                               Property Type *
                             </label>
                             <select
                               id="propertyType"
                               {...form.register('propertyType')}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                             >
                               {propertyTypes.map((type) => (
                                 <option key={type.value} value={type.value}>
                                   {type.label}
                                 </option>
                               ))}
                             </select>
                           </div>
                           
                           <div>
                             <label htmlFor="listingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                               Listing Price *
                             </label>
                             <div className="relative">
                               <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</div>
                               <Input
                                 id="listingPrice"
                                 {...form.register('listingPrice')}
                                 type="number"
                                 placeholder="275000"
                                 className="pl-10 h-12 text-lg"
                               />
                             </div>
                             {form.formState.errors.listingPrice && (
                               <p className="text-red-500 text-sm mt-1">{form.formState.errors.listingPrice.message}</p>
                             )}
                           </div>
                           
                           <div>
                             <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                               Timeline *
                             </label>
                             <select
                               id="timeline"
                               {...form.register('timeline')}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                             >
                               {timelineOptions.map((option) => (
                                 <option key={option.value} value={option.value}>
                                   {option.label}
                                 </option>
                               ))}
                             </select>
                           </div>
                         </div>

                         {/* Image Upload */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Property Images
                           </label>
                           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                             <div className="text-center">
                               <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <div className="w-6 h-6 text-gray-400">📷</div>
                               </div>
                               <div className="space-y-2">
                                 <label htmlFor="imageUpload" className="cursor-pointer">
                                   <span className="text-blue-600 hover:text-blue-700 font-medium">
                                     Click to upload images
                                   </span>
                                   <input
                                     id="imageUpload"
                                     type="file"
                                     multiple
                                     accept="image/*"
                                     onChange={handleImageUpload}
                                     className="hidden"
                                   />
                                 </label>
                                 <p className="text-sm text-gray-500">
                                   PNG, JPG, GIF up to 10MB each
                                 </p>
                               </div>
                             </div>
                             
                             {uploadingImages && (
                               <div className="mt-4 flex items-center justify-center">
                                 <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                 <span className="text-sm text-gray-600">Uploading images...</span>
                               </div>
                             )}
                             
                             {uploadedImages.length > 0 && (
                               <div className="mt-4">
                                 <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images ({uploadedImages.length})</h4>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                   {uploadedImages.map((imageUrl, index) => (
                                     <div key={index} className="relative group">
                                       <img
                                         src={imageUrl}
                                         alt={`Property image ${index + 1}`}
                                         className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                       />
                                       <button
                                         type="button"
                                         onClick={() => removeImage(index)}
                                         className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                       >
                                         ×
                                       </button>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     )}

                    {/* Step 3: Contact & Selling Method */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact & Selling Method</h3>
                          <p className="text-gray-600">How are you selling and how can buyers reach you?</p>
                        </div>
                        
                        {/* Selling Method */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            How Are You Selling? *
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {forSaleByOptions.map((type) => (
                              <div
                                key={type.value}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                  forSaleBy === type.value
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
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
                                  <div className={`w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    forSaleBy === type.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {forSaleBy === type.value && <div className="w-6 h-6">✓</div>}
                                  </div>
                                  <h4 className="font-medium text-gray-900 mb-1">{type.label}</h4>
                                  <p className="text-xs text-gray-600">{type.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Agent Information (conditional) */}
                        {forSaleBy === 'agent' && (
                          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-4">Agent Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-2">
                                  Agent Name *
                                </label>
                                <Input
                                  id="agentName"
                                  {...form.register('agentName')}
                                  placeholder="John Smith"
                                  className="h-11"
                                />
                              </div>
                              <div>
                                <label htmlFor="agentCompany" className="block text-sm font-medium text-gray-700 mb-2">
                                  Company *
                                </label>
                                <Input
                                  id="agentCompany"
                                  {...form.register('agentCompany')}
                                  placeholder="ABC Realty"
                                  className="h-11"
                                />
                              </div>
                              <div>
                                <label htmlFor="agentPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                  Agent Phone *
                                </label>
                                <Input
                                  id="agentPhone"
                                  {...form.register('agentPhone')}
                                  placeholder="(555) 123-4567"
                                  className="h-11"
                                />
                              </div>
                              <div>
                                <label htmlFor="agentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                  Agent Email *
                                </label>
                                <Input
                                  id="agentEmail"
                                  {...form.register('agentEmail')}
                                  type="email"
                                  placeholder="agent@company.com"
                                  className="h-11"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Contact Information */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-4">Your Contact Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                              </label>
                              <Input
                                id="contactPhone"
                                {...form.register('contactPhone')}
                                placeholder="(555) 123-4567"
                                className="h-11"
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
                                className="h-11"
                              />
                              {form.formState.errors.contactEmail && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactEmail.message}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-2">
                              Preferred Contact Method
                            </label>
                            <select
                              id="preferredContactMethod"
                              {...form.register('preferredContactMethod')}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            >
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="both">Both</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Footer */}
                  <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        {currentStep > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            className="px-6 py-2"
                          >
                            Previous
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {currentStep < 3 ? (
                          <Button
                            type="button"
                            onClick={nextStep}
                            disabled={!canProceedToNext()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Next Step
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={loading || !canProceedToNext()}
                            className="px-8 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Creating Listing...
                              </div>
                            ) : (
                              'Create Listing'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Listings View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Property Listings</h2>
                <Button onClick={loadUserListings} variant="outline" className="flex items-center gap-2">
                  <div className="w-4 h-4">🔄</div>
                  Refresh
                </Button>
              </div>

              {userListings.length > 0 ? (
                <div className="space-y-4">
                  {userListings.map((listing) => (
                    <Card key={listing.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {listing.title || listing.pins?.name || 'Property Listing'}
                              </h3>
                              <Badge className="bg-green-100 text-green-800">
                                {listing.status}
                              </Badge>
                            </div>
                            
                            {listing.description && (
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {listing.description}
                              </p>
                            )}
                            
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
                              
                              <div>
                                <span className="font-medium text-gray-700">Views:</span>
                                <div className="text-gray-600">
                                  {listing.views_count || 0}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Inquiries:</span>
                                <div className="text-gray-600">
                                  {listing.inquiries_count || 0}
                                </div>
                              </div>
                            </div>
                            
                            {/* Images Preview */}
                            {listing.images && listing.images.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Images ({listing.images.length})</h4>
                                <div className="grid grid-cols-4 gap-2">
                                  {listing.images.slice(0, 4).map((imageUrl, index) => (
                                    <img
                                      key={index}
                                      src={imageUrl}
                                      alt={`Property image ${index + 1}`}
                                      className="w-full h-16 object-cover rounded border border-gray-200"
                                    />
                                  ))}
                                  {listing.images.length > 4 && (
                                    <div className="w-full h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                      +{listing.images.length - 4} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
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
                <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 text-gray-400">🏠</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first property listing to start connecting with potential buyers.
                  </p>
                  <Button onClick={() => setActiveTab('submit')}>
                    Create First Listing
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
