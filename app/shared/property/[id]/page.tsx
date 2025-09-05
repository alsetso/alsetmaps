'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { 
  ShareIcon, 
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface SharedPropertyData {
  pin: any;
  forSaleListing: any;
  viewCount: number;
  lastViewed: string | null;
  shareUrl: string;
  hasAgreedToTerms: boolean;
  requiresTermsAgreement: boolean;
}

interface TermsAgreementForm {
  name: string;
  email: string;
}

export default function SharedPropertyPage() {
  const params = useParams();
  const [propertyData, setPropertyData] = useState<SharedPropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [termsForm, setTermsForm] = useState<TermsAgreementForm>({ name: '', email: '' });
  const [submittingTerms, setSubmittingTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  
  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const propertyId = params.id as string;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (propertyId) {
      loadSharedPropertyData();
    }
  }, [propertyId]);

  const loadSharedPropertyData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading shared property data for ID:', propertyId);

      // Use the shared property API endpoint
      const response = await fetch(`/api/shared/property/${propertyId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found or not publicly accessible');
        }
        throw new Error('Failed to load property data');
      }

      const data = await response.json();
      console.log('✅ Shared property data loaded:', data);

      setPropertyData(data);

    } catch (err) {
      console.error('Error loading shared property data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = useCallback(async () => {
    if (!propertyData?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(propertyData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [propertyData?.shareUrl]);

  // Mobile-optimized functions
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const handleMobileShare = useCallback(async () => {
    if (!propertyData?.pin) return;
    
    const shareUrl = propertyData.shareUrl;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyData.pin.name || 'Property Details',
          text: `Check out this property: ${propertyData.pin.input_address || propertyData.pin.name}`,
          url: shareUrl,
        });
      } catch (err) {
        // Fallback to clipboard
        await copyToClipboard();
      }
    } else {
      await copyToClipboard();
    }
  }, [propertyData?.pin, propertyData?.shareUrl, copyToClipboard]);

  const collectBrowserMetadata = () => {
    return {
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
      },
      deviceInfo: {
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        touchSupport: 'ontouchstart' in window,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        memory: (navigator as any).deviceMemory || null,
        cores: navigator.hardwareConcurrency || null
      },
      locationInfo: {
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    };
  };

  const submitTermsAgreement = async () => {
    if (!propertyData?.pin?.custom_terms || !termsForm.name || !termsForm.email) {
      setTermsError('Please fill in all required fields');
      return;
    }

    setSubmittingTerms(true);
    setTermsError(null);

    try {
      const metadata = collectBrowserMetadata();
      
      const response = await fetch(`/api/shared/property/${propertyId}/terms-agreement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: termsForm.name,
          email: termsForm.email,
          termsText: propertyData.pin.custom_terms,
          ...metadata,
          dataRetentionConsent: true
        })
      });

      if (response.ok) {
        await loadSharedPropertyData();
      } else {
        const errorData = await response.json();
        setTermsError(errorData.error || 'Failed to submit terms agreement');
      }
    } catch (err) {
      console.error('Error submitting terms agreement:', err);
      setTermsError('Failed to submit terms agreement');
    } finally {
      setSubmittingTerms(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPropertyType = (type: string) => {
    const types: { [key: string]: string } = {
      'single_family': 'Single Family',
      'condo': 'Condo',
      'townhouse': 'Townhouse',
      'multi_family': 'Multi-Family',
      'commercial': 'Commercial',
      'land': 'Land'
    };
    return types[type] || type;
  };

  const formatForSaleBy = (type: string) => {
    const types: { [key: string]: string } = {
      'owner': 'Owner',
      'agent': 'Agent',
      'wholesaler': 'Wholesale'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SharedLayout>
    );
  }

  if (error || !propertyData) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The property you\'re looking for doesn\'t exist or is not publicly accessible.'}</p>
            <Button onClick={() => window.location.href = '/'}>Go Home</Button>
          </div>
        </div>
      </SharedLayout>
    );
  }

  // Show terms agreement gate if required and not yet agreed
  if (propertyData.requiresTermsAgreement && !propertyData.hasAgreedToTerms) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-xl">Terms Agreement Required</CardTitle>
                <p className="text-center text-gray-600">
                  To view this property's details, you must agree to the owner's terms and conditions.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Terms Text */}
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <h4 className="font-semibold mb-2">Terms and Conditions:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {propertyData.pin.custom_terms}
                  </p>
                </div>

                {/* Agreement Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={termsForm.name}
                      onChange={(e) => setTermsForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={termsForm.email}
                      onChange={(e) => setTermsForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  {termsError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                      {termsError}
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Legal Notice:</strong> By submitting this form, you agree to the terms above and consent to the collection of your information for legal compliance purposes. Your IP address, browser information, and other metadata will be recorded.
                    </p>
                  </div>

                  <Button 
                    onClick={submitTermsAgreement}
                    disabled={submittingTerms || !termsForm.name || !termsForm.email}
                    className="w-full"
                    size="lg"
                  >
                    {submittingTerms ? 'Submitting...' : 'I Agree to the Terms'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const { pin, forSaleListing, shareUrl } = propertyData;

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-Optimized Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {isMobile ? (
              <div className="space-y-4">
                {/* Property Title and Address */}
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    {pin.name || pin.title || 'Property Details'}
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{pin.input_address || pin.name || 'Property Location'}</span>
                  </p>
                </div>
                
                {/* Mobile Share Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMobileShare}
                    className="flex items-center space-x-2 w-full sm:w-auto"
                  >
                    <ShareIcon className="h-4 w-4" />
                    <span>{copied ? 'Copied!' : 'Share Property'}</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Desktop Header */
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {pin.name || pin.title || 'Property Details'}
                    </h1>
                    <p className="text-gray-600 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {pin.input_address || pin.name || 'Property Location'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2"
                  >
                    <ShareIcon className="h-4 w-4" />
                    <span>{copied ? 'Copied!' : 'Share'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Mobile Optimized */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
          }`}>
            {/* Left Column - Main Content */}
            <div className={`space-y-4 sm:space-y-6 ${isMobile ? '' : 'lg:col-span-2'}`}>
              {/* Property Overview - Mobile Optimized */}
              <Card>
                <CardHeader 
                  className={`${isMobile ? 'cursor-pointer' : ''}`}
                  onClick={isMobile ? () => toggleSection('overview') : undefined}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HomeIcon className="h-5 w-5 mr-2" />
                      Property Overview
                    </div>
                    {isMobile && (
                      expandedSections.has('overview') ? 
                        <ChevronUpIcon className="h-5 w-5" /> : 
                        <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </CardTitle>
                </CardHeader>
                {(!isMobile || expandedSections.has('overview')) && (
                  <CardContent>
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-gray-900 break-words">{pin.input_address || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Coordinates</label>
                        <p className="text-gray-900 font-mono text-sm">{pin.latitude}, {pin.longitude}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-gray-900 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                          {formatDate(pin.created_at)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-gray-900 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                          {formatDate(pin.updated_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Notes */}
              {pin.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Property Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 whitespace-pre-wrap">{pin.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              {pin.images && pin.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Property Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pin.images.map((image: string, index: number) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - For Sale Listing - Mobile moves to bottom */}
            <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'order-last' : ''}`}>
              {forSaleListing ? (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-600 flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                      For Sale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Title</label>
                        <p className="text-gray-900 font-semibold">{forSaleListing.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-gray-900">{forSaleListing.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Property Type</label>
                        <p className="text-gray-900">{formatPropertyType(forSaleListing.property_type)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Listing Price</label>
                        <p className="text-gray-900 font-semibold text-lg text-green-600">
                          ${forSaleListing.listing_price?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Timeline</label>
                        <p className="text-gray-900">{forSaleListing.timeline}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">For Sale By</label>
                        <p className="text-gray-900">{formatForSaleBy(forSaleListing.for_sale_by)}</p>
                      </div>
                      
                      {/* Contact Information */}
                      {forSaleListing.agent_name && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <UserIcon className="h-4 w-4 mr-2" />
                            Agent Information
                          </h4>
                          <div className="space-y-2">
                            <p className="text-gray-900 font-medium">{forSaleListing.agent_name}</p>
                            {forSaleListing.agent_company && (
                              <p className="text-gray-600 flex items-center">
                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                {forSaleListing.agent_company}
                              </p>
                            )}
                            {forSaleListing.agent_phone && (
                              <p className="text-gray-600 flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {forSaleListing.agent_phone}
                              </p>
                            )}
                            {forSaleListing.agent_email && (
                              <p className="text-gray-600 flex items-center">
                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                {forSaleListing.agent_email}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {forSaleListing.contact_info && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                          <p className="text-gray-900">{forSaleListing.contact_info}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          forSaleListing.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {forSaleListing.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Property Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">This property is not currently listed for sale.</p>
                  </CardContent>
                </Card>
              )}

              {/* Share Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShareIcon className="h-5 w-5 mr-2" />
                    Share This Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Share URL</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                        />
                        <Button 
                          size="sm" 
                          onClick={copyToClipboard}
                          variant="outline"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Views</label>
                      <p className="text-gray-900">{propertyData.viewCount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
