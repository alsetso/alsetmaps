'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/authentication';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  PencilIcon,
  SparklesIcon,
  HomeIcon,
  PlusIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CogIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { PinSharingModal } from '@/features/property-management/components/PinSharingModal';

interface PropertyData {
  pin: any;
  searchHistory: any;
  forSaleListing: any;
  isOwner: boolean;
  isPublic: boolean;
  viewCount: number;
  lastViewed: string | null;
  shareUrl: string;
}

interface SmartData {
  propertyType: string;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  estimatedValue: number;
  marketTrends: {
    trend: string;
    changePercent: number;
    timeframe: string;
  };
  investmentPotential: {
    score: number;
    factors: string[];
  };
  walkScore: number;
  schoolDistrict: string;
}

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [smartData, setSmartData] = useState<SmartData | null>(null);
  const [generatingSmartData, setGeneratingSmartData] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [showMobileActions, setShowMobileActions] = useState(false);

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
    if (propertyId && !authLoading) {
      loadPropertyData();
    }
  }, [propertyId, user, authLoading]);

  const loadPropertyData = async () => {
    try {
      console.log('🔍 Loading property data for ID:', propertyId);
      console.log('🔍 Current user:', user?.id);
      
      setLoading(true);
      setError(null);

      // Use a simplified approach - fetch from the pins API with service role
      const response = await fetch(`/api/pins/${propertyId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found');
        }
        throw new Error('Failed to load property data');
      }

      const data = await response.json();
      console.log('✅ Property data loaded:', data);

      // Determine ownership using direct auth_user_id comparison (much simpler!)
      let isOwner = false;
      if (user && data.pin?.auth_user_id) {
        isOwner = data.pin.auth_user_id === user.id;
        console.log('🔍 Ownership check (simplified):', {
          pinAuthUserId: data.pin.auth_user_id,
          currentUserId: user.id,
          isOwner
        });
      }

      setPropertyData({
        pin: data.pin,
        searchHistory: data.searchHistory || null,
        forSaleListing: data.forSaleListing,
        isOwner,
        isPublic: data.pin?.is_public || false,
        viewCount: data.viewCount || 0,
        lastViewed: data.lastViewed,
        shareUrl: data.shareUrl || `${window.location.origin}/shared/property/${propertyId}`
      });

    } catch (err) {
      console.error('Error loading property data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSearchType = (type: string) => {
    const types: { [key: string]: string } = {
      'buy': 'Buy',
      'sell': 'Sell',
      'rent': 'Rent',
      'invest': 'Invest'
    };
    return types[type] || type;
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

  const generateSmartData = async () => {
    if (!propertyData?.pin) return;
    
    setGeneratingSmartData(true);
    try {
      const response = await fetch('/api/property/smart-search', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: propertyData.pin.latitude,
          longitude: propertyData.pin.longitude,
          address: propertyData.pin.input_address || propertyData.pin.name
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSmartData(data.data);
      }
    } catch (error) {
      console.error('Error generating smart data:', error);
    } finally {
      setGeneratingSmartData(false);
    }
  };

  const togglePinVisibility = async () => {
    if (!propertyData?.pin || !propertyData.isOwner) return;
    
    setUpdatingVisibility(true);
    try {
      const newVisibility = !propertyData.isPublic;
      const response = await fetch(`/api/pins/${propertyId}/visibility`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: newVisibility })
      });
      
      if (response.ok) {
        setPropertyData(prev => prev ? {
          ...prev,
          isPublic: newVisibility
        } : null);
      } else {
        console.error('Failed to update pin visibility');
      }
    } catch (error) {
      console.error('Error updating pin visibility:', error);
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const copyShareUrlToClipboard = useCallback(async () => {
    if (!propertyData?.pin) return;
    
    const shareUrl = `${window.location.origin}/shared/property/${propertyId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [propertyData?.pin, propertyId]);

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
    
    const shareUrl = `${window.location.origin}/shared/property/${propertyId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyData.pin.name || 'Property Details',
          text: `Check out this property: ${propertyData.pin.input_address || propertyData.pin.name}`,
          url: shareUrl,
        });
      } catch (err) {
        // Fallback to clipboard
        await copyShareUrlToClipboard();
      }
    } else {
      await copyShareUrlToClipboard();
    }
  }, [propertyData?.pin, propertyId, copyShareUrlToClipboard]);

  if (authLoading || loading) {
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
            <p className="text-gray-600 mb-6">{error || 'The property you\'re looking for doesn\'t exist.'}</p>
            <div className="space-x-4">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>Dashboard</Button>
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const { pin, searchHistory, forSaleListing } = propertyData;

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-Optimized Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Mobile Header */}
            {isMobile ? (
              <div className="space-y-4">
                {/* Top Row - Back Button and Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="hidden xs:inline">Back</span>
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {propertyData.isPublic && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleMobileShare}
                        className="flex items-center space-x-1"
                      >
                        <ShareIcon className="h-4 w-4" />
                        <span className="hidden xs:inline">{copied ? 'Copied!' : 'Share'}</span>
                      </Button>
                    )}
                    {propertyData.isOwner && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowMobileActions(!showMobileActions)}
                        className="flex items-center space-x-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="hidden xs:inline">Actions</span>
                      </Button>
                    )}
                  </div>
                </div>
                
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
                
                {/* Mobile Actions Dropdown */}
                {showMobileActions && propertyData.isOwner && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={togglePinVisibility}
                      disabled={updatingVisibility}
                      className="w-full justify-start"
                    >
                      {updatingVisibility ? (
                        'Updating...'
                      ) : propertyData.isPublic ? (
                        <>
                          <EyeSlashIcon className="h-4 w-4 mr-2" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Make Public
                        </>
                      )}
                    </Button>
                    <PinSharingModal 
                      pin={propertyData.pin} 
                      onPinUpdated={(updatedPin) => {
                        // Update the property data with the new pin data
                        setPropertyData(prev => ({
                          ...prev,
                          pin: updatedPin,
                          isPublic: updatedPin.is_public || false
                        }));
                      }}
                      trigger={
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full justify-start"
                        >
                          <CogIcon className="h-4 w-4 mr-2" />
                          Manage Sharing
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Header */
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Back</span>
                  </Button>
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
                  {propertyData.isOwner && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={togglePinVisibility}
                      disabled={updatingVisibility}
                    >
                      {updatingVisibility ? (
                        'Updating...'
                      ) : propertyData.isPublic ? (
                        <>
                          <EyeSlashIcon className="h-4 w-4 mr-2" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Make Public
                        </>
                      )}
                    </Button>
                  )}
                  {propertyData.isPublic && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyShareUrlToClipboard}
                      className="flex items-center space-x-2"
                    >
                      <ShareIcon className="h-4 w-4" />
                      <span>{copied ? 'Copied!' : 'Share'}</span>
                    </Button>
                  )}
                  {propertyData.isOwner && (
                    <PinSharingModal 
                      pin={propertyData.pin} 
                      onPinUpdated={(updatedPin) => {
                        // Update the property data with the new pin data
                        setPropertyData(prev => ({
                          ...prev,
                          pin: updatedPin,
                          isPublic: updatedPin.is_public || false
                        }));
                      }}
                      trigger={
                        <Button variant="outline" size="sm">
                          <CogIcon className="h-4 w-4 mr-2" />
                          Manage Sharing
                        </Button>
                      }
                    />
                  )}
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

              {/* Search History */}
              {searchHistory && (
                <Card>
                  <CardHeader>
                    <CardTitle>Search History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Search Address</label>
                        <p className="text-gray-900">{searchHistory.search_address}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Search Type</label>
                        <p className="text-gray-900">{formatSearchType(searchHistory.search_type)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Search Date</label>
                        <p className="text-gray-900">{formatDate(searchHistory.created_at)}</p>
                      </div>
                      {searchHistory.search_type === 'basic' && !smartData && (
                        <div className="border-t pt-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">Generate Smart Data</h4>
                                <p className="text-gray-600 text-sm">Get detailed property intelligence</p>
                              </div>
                              <Button 
                                onClick={generateSmartData}
                                disabled={generatingSmartData}
                                size="sm"
                                variant="outline"
                              >
                                {generatingSmartData ? 'Generating...' : 'Generate'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Smart Data */}
              {smartData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      Property Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Property Type</label>
                          <p className="text-gray-900">{smartData.propertyType}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Square Footage</label>
                          <p className="text-gray-900">{smartData.squareFootage?.toLocaleString()} sq ft</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bedrooms</label>
                          <p className="text-gray-900">{smartData.bedrooms}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bathrooms</label>
                          <p className="text-gray-900">{smartData.bathrooms}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Market Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-xl font-semibold text-gray-900">${smartData.estimatedValue?.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Estimated Value</p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-xl font-semibold text-gray-900">{smartData.marketTrends?.changePercent}%</p>
                            <p className="text-sm text-gray-600">Market Trend</p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-xl font-semibold text-gray-900">{smartData.investmentPotential?.score}/10</p>
                            <p className="text-sm text-gray-600">Investment Score</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Neighborhood</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Walk Score</label>
                            <p className="text-gray-900">{smartData.walkScore}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">School District</label>
                            <p className="text-gray-900">{smartData.schoolDistrict}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sharing Status - Only show for owners */}
              {propertyData.isOwner && (
                <Card>
                  <CardHeader 
                    className={`${isMobile ? 'cursor-pointer' : ''}`}
                    onClick={isMobile ? () => toggleSection('sharing') : undefined}
                  >
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShareIcon className="h-5 w-5 mr-2" />
                        Sharing Status
                      </div>
                      {isMobile && (
                        expandedSections.has('sharing') ? 
                          <ChevronUpIcon className="h-5 w-5" /> : 
                          <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {(!isMobile || expandedSections.has('sharing')) && (
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {propertyData.isPublic ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <EyeIcon className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <EyeSlashIcon className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                            <span className="text-sm text-gray-600">
                              {propertyData.isPublic ? 'Property is publicly accessible' : 'Property is private'}
                            </span>
                          </div>
                        </div>

                        {propertyData.isPublic && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Share URL</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={propertyData.shareUrl}
                                  readOnly
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={copyShareUrlToClipboard}
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
                        )}

                        {pin.requires_terms_agreement && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-sm text-blue-800 font-medium">
                                Terms Agreement Required
                              </span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                              Viewers must agree to terms before accessing property details
                            </p>
                          </div>
                        )}

                        {pin.listing_price && (
                          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-green-800 font-medium">
                                For Sale Listing Active
                              </span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                              Listed for ${pin.listing_price?.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Notes */}
              {pin.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
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
                    <CardTitle>Images</CardTitle>
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
              {/* Create Listing Section */}
              {!forSaleListing && propertyData.isOwner && (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">List This Property</h3>
                      <p className="text-gray-600 mb-4">
                        Create a listing to sell this property on our marketplace
                      </p>
                      <Button 
                        onClick={() => router.push(`/sell?pinId=${propertyId}`)}
                        className="w-full"
                        size="lg"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Listing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {forSaleListing ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">For Sale</CardTitle>
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
                        <p className="text-gray-900 font-semibold text-lg">${forSaleListing.listing_price?.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Timeline</label>
                        <p className="text-gray-900">{forSaleListing.timeline}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">For Sale By</label>
                        <p className="text-gray-900">{formatForSaleBy(forSaleListing.for_sale_by)}</p>
                      </div>
                      {forSaleListing.agent_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Agent</label>
                          <p className="text-gray-900">{forSaleListing.agent_name}</p>
                          {forSaleListing.agent_company && (
                            <p className="text-gray-600 text-sm">{forSaleListing.agent_company}</p>
                          )}
                          {forSaleListing.agent_phone && (
                            <p className="text-gray-600 text-sm">{forSaleListing.agent_phone}</p>
                          )}
                          {forSaleListing.agent_email && (
                            <p className="text-gray-600 text-sm">{forSaleListing.agent_email}</p>
                          )}
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Info</label>
                        <p className="text-gray-900">{forSaleListing.contact_info}</p>
                      </div>
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
                      <div>
                        <label className="text-sm font-medium text-gray-500">Views</label>
                        <p className="text-gray-900">{forSaleListing.views_count || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Inquiries</label>
                        <p className="text-gray-900">{forSaleListing.inquiries_count || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Not For Sale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">This property is not currently listed for sale.</p>
                  </CardContent>
                </Card>
              )}

              {/* Property Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Views</label>
                      <p className="text-gray-900">{propertyData.viewCount || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Viewed</label>
                      <p className="text-gray-900">
                        {propertyData.lastViewed ? formatDate(propertyData.lastViewed) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Visibility</label>
                      <p className="text-gray-900">
                        {propertyData.isPublic ? 'Public' : 'Private'}
                      </p>
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
