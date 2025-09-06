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
  ArrowLeftIcon,
  EyeIcon,
  ChartBarIcon,
  SparklesIcon
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

  const propertyId = params.id as string;

  useEffect(() => {
    if (propertyId) {
      loadSharedPropertyData();
    }
  }, [propertyId]);

  const loadSharedPropertyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shared/property/${propertyId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found or not publicly accessible');
        }
        throw new Error('Failed to load property data');
      }

      const data = await response.json();
      setPropertyData(data);

    } catch (err) {
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

  const submitTermsAgreement = async () => {
    if (!termsForm.name.trim() || !termsForm.email.trim()) {
      setTermsError('Please fill in all required fields');
      return;
    }

    setSubmittingTerms(true);
    setTermsError(null);

    try {
      const response = await fetch(`/api/shared/property/${propertyId}/terms-agreement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(termsForm)
      });

      if (!response.ok) {
        throw new Error('Failed to submit terms agreement');
      }

      // Reload property data to get updated state
      await loadSharedPropertyData();

    } catch (err) {
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
                    <div className="text-red-600 text-sm">{termsError}</div>
                  )}

                  <Button 
                    onClick={submitTermsAgreement}
                    disabled={submittingTerms}
                    className="w-full"
                  >
                    {submittingTerms ? 'Submitting...' : 'Agree and Continue'}
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
        {/* Data Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {pin.name || pin.title || 'Property Details'}
                  </h1>
                  <p className="text-sm text-gray-600">{pin.input_address}</p>
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
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Core Property Data */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Core Property Data</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${pin.input_address ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>Address</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {pin.input_address || 'Not specified'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Coordinates</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {pin.latitude}, {pin.longitude}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Created</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(pin.created_at)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Last Updated</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(pin.updated_at)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* For Sale Listing */}
            {pin.is_for_sale && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                    For Sale Listing
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pin.listing_price && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Listing Price</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold text-green-600">
                            ${pin.listing_price.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      {pin.property_type && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Property Type</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatPropertyType(pin.property_type)}
                          </td>
                        </tr>
                      )}
                      {pin.bedrooms && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Bedrooms</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pin.bedrooms}</td>
                        </tr>
                      )}
                      {pin.bathrooms && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Bathrooms</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pin.bathrooms}</td>
                        </tr>
                      )}
                      {pin.square_feet && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Square Feet</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pin.square_feet.toLocaleString()}</td>
                        </tr>
                      )}
                      {pin.lot_size && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Lot Size</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pin.lot_size} sq ft</td>
                        </tr>
                      )}
                      {pin.year_built && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Year Built</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pin.year_built}</td>
                        </tr>
                      )}
                      {pin.listing_status && (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Listing Status</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              pin.listing_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pin.listing_status}
                            </span>
                          </td>
                        </tr>
                      )}
                      {pin.for_sale_by && (
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">For Sale By</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatForSaleBy(pin.for_sale_by)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Agent Contact Information */}
            {(pin.agent_name || pin.agent_phone || pin.agent_email) && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Agent Contact Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pin.agent_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Agent Name</label>
                        <p className="text-gray-900">{pin.agent_name}</p>
                      </div>
                    )}
                    {pin.agent_company && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Company</label>
                        <p className="text-gray-900">{pin.agent_company}</p>
                      </div>
                    )}
                    {pin.agent_phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900 flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          <a href={`tel:${pin.agent_phone}`} className="text-blue-600 hover:text-blue-800">
                            {pin.agent_phone}
                          </a>
                        </p>
                      </div>
                    )}
                    {pin.agent_email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900 flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          <a href={`mailto:${pin.agent_email}`} className="text-blue-600 hover:text-blue-800">
                            {pin.agent_email}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {pin.notes && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Property Notes</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-900 whitespace-pre-wrap">{pin.notes}</p>
                </div>
              </div>
            )}

            {/* Images */}
            {pin.images && pin.images.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Property Images</h3>
                </div>
                <div className="p-6">
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}