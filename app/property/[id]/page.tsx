'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/authentication';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Textarea } from '@/features/shared/components/ui/textarea';
import { Switch } from '@/features/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/shared/components/ui/select';
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
  CurrencyDollarIcon,
  LinkIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ZillowCheckButton, DebugApiEditor, PropertyDataDisplay } from '@/features/shared/components';

interface PropertyData {
  pin: any;
  searchHistory: any;
  forSaleListing: any;
  viewCount: number;
  lastViewed: string | null;
  shareUrl: string;
}

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  
  // UI state
  const [saving, setSaving] = useState(false);
  
  // Intelligence data state
  const [intelligenceData, setIntelligenceData] = useState<any>(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);

  const propertyId = params.id as string;


  useEffect(() => {
    if (propertyId && !authLoading) {
      loadPropertyData();
    }
  }, [propertyId, user, authLoading]);


  const loadPropertyData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading property data for:', propertyId);
      console.log('🔍 User:', user);
      console.log('🔍 Auth loading:', authLoading);

      // Use the SAME API approach as the shared property page
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
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to load property data');
      }

      const data = await response.json();
      
      // Simple property data - no ownership or public/private logic
      const finalPropertyData = {
        pin: data.pin,
        searchHistory: data.searchHistory || null,
        forSaleListing: data.forSaleListing,
        viewCount: data.viewCount || 0,
        lastViewed: data.lastViewed,
        shareUrl: data.shareUrl || `${window.location.origin}/shared/property/${propertyId}`
      };
      
      setPropertyData(finalPropertyData);

    } catch (error) {
      console.error('Error loading property data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  const copyShareUrlToClipboard = useCallback(async () => {
    if (!propertyData?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(propertyData.shareUrl);
      // You could add a toast notification here
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = propertyData.shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [propertyData?.shareUrl]);


  const fetchIntelligenceData = useCallback(async () => {
    if (!propertyData?.pin?.input_address) return;

    setLoadingIntelligence(true);
    setIntelligenceError(null);

    try {
      const response = await fetch('/api/intelligence/zillow', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: propertyData.pin.input_address })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch intelligence data');
      }

      const data = await response.json();
      setIntelligenceData(data);
    } catch (error) {
      console.error('Error fetching intelligence data:', error);
      setIntelligenceError(error instanceof Error ? error.message : 'Failed to fetch intelligence data');
    } finally {
      setLoadingIntelligence(false);
    }
  }, [propertyData?.pin?.input_address]);


  // Field validation
  const validateField = useCallback((field: string, value: any): string | null => {
    if (!value && value !== 0) return null; // Allow empty values
    
    // Map display field names to validation field names
    const validationFieldMapping: Record<string, string> = {
      'Property Name': 'name',
      'Address': 'input_address',
      'Notes': 'notes',
      'Property Type': 'property_type',
      'Bedrooms': 'bedrooms',
      'Bathrooms': 'bathrooms',
      'Square Feet': 'square_feet',
      'Lot Size (acres)': 'lot_size',
      'Year Built': 'year_built',
      'Listing Price': 'listing_price',
      'Listing Description': 'listing_description',
      'Listing Status': 'listing_status',
      'For Sale By': 'for_sale_by',
      'Timeline': 'timeline',
      'HOA Fees (monthly)': 'hoa_fees',
      'Property Taxes (annual)': 'property_taxes',
      'Agent Name': 'agent_name',
      'Agent Company': 'agent_company',
      'Agent Phone': 'agent_phone',
      'Agent Email': 'agent_email',
      'Agent License': 'agent_license',
      'Heating Type': 'heating_type',
      'Cooling Type': 'cooling_type',
      'Roof Type': 'roof_type',
      'Exterior Material': 'exterior_material',
      'Foundation Type': 'foundation_type',
      'Garage Type': 'garage_type',
      'Parking Spaces': 'parking_spaces',
      'School District': 'school_district',
      'Elementary School': 'elementary_school',
      'Middle School': 'middle_school',
      'High School': 'high_school',
      'SEO Title': 'seo_title',
      'SEO Description': 'seo_description',
      'Custom Domain': 'custom_domain',
      'Custom Terms': 'custom_terms'
    };

    const validationField = validationFieldMapping[field] || field;
    
    switch (validationField) {
      case 'listing_price':
      case 'hoa_fees':
      case 'property_taxes':
        if (isNaN(Number(value)) || Number(value) < 0) {
          return 'Must be a valid positive number';
        }
        break;
      case 'bedrooms':
      case 'bathrooms':
      case 'square_feet':
      case 'year_built':
      case 'parking_spaces':
        if (isNaN(Number(value)) || Number(value) < 0) {
          return 'Must be a valid positive number';
        }
        break;
      case 'lot_size':
        if (isNaN(Number(value)) || Number(value) < 0) {
          return 'Must be a valid positive number';
        }
        break;
      case 'custom_domain':
        if (value && !/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z]{2,}$/.test(value)) {
          return 'Invalid domain format';
        }
        break;
    }
    return null;
  }, []);

  const handleFieldUpdate = useCallback(async (field: string, value: any) => {
    if (!propertyData?.pin) return;

    try {
      // Validate the field
      const validationError = validateField(field, value);
      if (validationError) {
        throw new Error(validationError);
      }

      // Map display field names to actual database column names
      const fieldMapping: Record<string, string> = {
        'Property Name': 'name',
        'Address': 'input_address',
        'Notes': 'notes',
        'Property Type': 'property_type',
        'Bedrooms': 'bedrooms',
        'Bathrooms': 'bathrooms',
        'Square Feet': 'square_feet',
        'Lot Size (acres)': 'lot_size',
        'Year Built': 'year_built',
        'Listing Price': 'listing_price',
        'Listing Description': 'listing_description',
        'Listing Status': 'listing_status',
        'For Sale By': 'for_sale_by',
        'Timeline': 'timeline',
        'HOA Fees (monthly)': 'hoa_fees',
        'Property Taxes (annual)': 'property_taxes',
        'Agent Name': 'agent_name',
        'Agent Company': 'agent_company',
        'Agent Phone': 'agent_phone',
        'Agent Email': 'agent_email',
        'Agent License': 'agent_license',
        'Heating Type': 'heating_type',
        'Cooling Type': 'cooling_type',
        'Roof Type': 'roof_type',
        'Exterior Material': 'exterior_material',
        'Foundation Type': 'foundation_type',
        'Garage Type': 'garage_type',
        'Parking Spaces': 'parking_spaces',
        'School District': 'school_district',
        'Elementary School': 'elementary_school',
        'Middle School': 'middle_school',
        'High School': 'high_school',
        'SEO Title': 'seo_title',
        'SEO Description': 'seo_description',
        'Custom Domain': 'custom_domain',
        'Custom Terms': 'custom_terms'
      };

      // Get the actual database column name
      const dbColumnName = fieldMapping[field] || field;
      
      // Handle different field types and data conversion
      let updateData: any = {};
      
      if (dbColumnName === 'bedrooms' || dbColumnName === 'square_feet' || dbColumnName === 'year_built' || dbColumnName === 'parking_spaces') {
        updateData[dbColumnName] = value ? parseInt(value) : null;
      } else if (dbColumnName === 'bathrooms' || dbColumnName === 'lot_size' || dbColumnName === 'listing_price' || dbColumnName === 'hoa_fees' || dbColumnName === 'property_taxes') {
        updateData[dbColumnName] = value ? parseFloat(value) : null;
      } else {
        updateData[dbColumnName] = value;
      }

      console.log('Updating field:', { field, dbColumnName, value, updateData });

      const response = await fetch(`/api/pins/${propertyId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
        
        if (!response.ok) {
          const errorData = await response.json();
        console.error('Update error:', errorData);
          throw new Error(errorData.details || errorData.error || 'Failed to update field');
      }
      
    } catch (error) {
      console.error('Error updating field:', error);
      throw error;
    }
  }, [propertyData?.pin, propertyId, validateField]);



  if (authLoading || loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header Skeleton */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex justify-between items-center">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  if (error) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <div className="space-x-4">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>Dashboard</Button>
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  if (!propertyData?.pin) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or you don't have access to it.</p>
            <div className="space-x-4">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>Dashboard</Button>
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const { pin, searchHistory, viewCount, lastViewed, shareUrl } = propertyData;

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Data Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {pin.name || pin.title || 'Property Data'}
                </h1>
                  <p className="text-sm text-gray-600">{pin.input_address}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right text-sm">
                  <div className="text-gray-600">Status</div>
                  <div className="font-medium">
                    {pin.is_public ? 'Public' : 'Private'} • {pin.is_for_sale ? 'For Sale' : 'Not Listed'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Debug API Editor */}
          <DebugApiEditor 
            propertyId={propertyId}
            onDataUpdate={loadPropertyData}
          />

          {/* Zillow Check Button */}
          <ZillowCheckButton 
            address={pin.name || pin.title || pin.input_address} 
            className="mb-8"
          />

          {/* Intelligence Data Table */}
          {intelligenceData && (
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Market Intelligence</h3>
                  <p className="text-sm text-gray-600">Zillow data for {pin.input_address}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {intelligenceData.zestimate && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Zestimate</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${intelligenceData.zestimate.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Zillow</td>
                        </tr>
                      )}
                      {intelligenceData.rentZestimate && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rent Zestimate</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${intelligenceData.rentZestimate.toLocaleString()}/mo</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Zillow</td>
                        </tr>
                      )}
                      {intelligenceData.lotSize && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Lot Size</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intelligenceData.lotSize}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Zillow</td>
                        </tr>
                      )}
                      {intelligenceData.yearBuilt && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Year Built</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intelligenceData.yearBuilt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Zillow</td>
                        </tr>
                      )}
                      {intelligenceData.bedrooms && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Bedrooms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intelligenceData.bedrooms}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Zillow</td>
                        </tr>
                      )}
                      {intelligenceData.bathrooms && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Bathrooms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intelligenceData.bathrooms}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Zillow</td>
                        </tr>
                      )}
                      {intelligenceData.livingArea && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Living Area</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intelligenceData.livingArea} sq ft</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Zillow</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {intelligenceError && (
            <Card className="mb-8 border-red-200">
              <CardContent className="pt-6">
                <div className="text-red-600 text-sm">
                  Error loading intelligence data: {intelligenceError}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organized Property Data Display */}
          <PropertyDataDisplay 
            propertyData={propertyData}
            onFieldUpdate={handleFieldUpdate}
            onDataReload={loadPropertyData}
          />
        </div>

      </div>
    </SharedLayout>
  );
}