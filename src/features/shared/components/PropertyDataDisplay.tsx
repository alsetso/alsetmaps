'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  EyeIcon,
  ShareIcon,
  CogIcon,
  ChartBarIcon,
  AcademicCapIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface PropertyData {
  pin: any;
  searchHistory?: any;
  forSaleListing?: any;
  viewCount?: number;
  lastViewed?: string | null;
  shareUrl?: string;
}

interface PropertyDataDisplayProps {
  propertyData: PropertyData;
  onFieldUpdate?: (field: string, value: any) => Promise<void>;
  onDataReload?: () => Promise<void>;
}

interface EditingState {
  field: string | null;
  value: string;
  saving: boolean;
  error: string | null;
}

export function PropertyDataDisplay({ propertyData, onFieldUpdate, onDataReload }: PropertyDataDisplayProps) {
  const [editing, setEditing] = useState<EditingState>({
    field: null,
    value: '',
    saving: false,
    error: null
  });

  const { pin } = propertyData;

  const startEditing = useCallback((field: string, currentValue: any) => {
    setEditing({
      field,
      value: currentValue?.toString() || '',
      saving: false,
      error: null
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditing({
      field: null,
      value: '',
      saving: false,
      error: null
    });
  }, []);

  const saveField = useCallback(async () => {
    if (!editing.field || !onFieldUpdate) return;

    setEditing(prev => ({ ...prev, saving: true, error: null }));

    try {
      await onFieldUpdate(editing.field, editing.value);
      setEditing({
        field: null,
        value: '',
        saving: false,
        error: null
      });
      
      if (onDataReload) {
        await onDataReload();
      }
    } catch (error) {
      setEditing(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : 'Failed to save'
      }));
    }
  }, [editing.field, editing.value, onFieldUpdate, onDataReload]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveField();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  }, [saveField, cancelEditing]);

  const renderEditableField = (
    field: string,
    value: any,
    type: 'text' | 'number' | 'textarea' | 'select' = 'text',
    options?: { label: string; value: string }[],
    placeholder?: string
  ) => {
    const isEditing = editing.field === field;
    const hasValue = value !== null && value !== undefined && value !== '';

    return (
      <div className="flex items-center justify-between group">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${hasValue ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-900">{field}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              {type === 'textarea' ? (
                <Textarea
                  value={editing.value}
                  onChange={(e) => setEditing(prev => ({ ...prev, value: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  className="text-sm w-64"
                  rows={2}
                  autoFocus
                />
              ) : type === 'select' && options ? (
                <Select value={editing.value} onValueChange={(value) => setEditing(prev => ({ ...prev, value }))}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={type}
                  value={editing.value}
                  onChange={(e) => setEditing(prev => ({ ...prev, value: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  className="text-sm w-48"
                  placeholder={placeholder}
                  autoFocus
                />
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={saveField}
                disabled={editing.saving}
                className="p-1 h-6 w-6"
              >
                {editing.saving ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                ) : (
                  <CheckIcon className="h-4 w-4 text-green-600" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelEditing}
                className="p-1 h-6 w-6"
              >
                <XMarkIcon className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => startEditing(field, value)}
              className="text-left hover:bg-gray-100 px-2 py-1 rounded w-full text-sm text-gray-900"
            >
              {value || <span className="text-gray-400 italic">Click to set</span>}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Core Property Information */}
      {renderSection(
        'Core Property Information',
        <HomeIcon className="h-5 w-5 text-blue-600" />,
        <>
          {renderEditableField('Property Name', pin.name, 'text', undefined, 'Enter property name')}
          {renderEditableField('Address', pin.input_address, 'text', undefined, 'Enter full address')}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-gray-900">Coordinates</span>
            </div>
            <span className="text-sm text-gray-600 font-mono">
              {pin.latitude}, {pin.longitude}
            </span>
          </div>
          {renderEditableField('Property Type', pin.property_type, 'select', [
            { label: 'Single Family', value: 'single-family' },
            { label: 'Multi-Family', value: 'multi-family' },
            { label: 'Condominium', value: 'condo' },
            { label: 'Townhouse', value: 'townhouse' },
            { label: 'Land', value: 'land' },
            { label: 'Commercial', value: 'commercial' }
          ])}
          {renderEditableField('Notes', pin.notes, 'textarea', undefined, 'Add property notes')}
        </>
      )}

      {/* Property Details */}
      {renderSection(
        'Property Details',
        <MapPinIcon className="h-5 w-5 text-green-600" />,
        <>
          {renderEditableField('Bedrooms', pin.bedrooms, 'number')}
          {renderEditableField('Bathrooms', pin.bathrooms, 'number')}
          {renderEditableField('Square Feet', pin.square_feet, 'number')}
          {renderEditableField('Lot Size (acres)', pin.lot_size, 'number')}
          {renderEditableField('Year Built', pin.year_built, 'number')}
        </>
      )}

      {/* Listing Information */}
      {pin.is_for_sale && renderSection(
        'Listing Information',
        <CurrencyDollarIcon className="h-5 w-5 text-yellow-600" />,
        <>
          {renderEditableField('Listing Price', pin.listing_price, 'number')}
          {renderEditableField('Listing Description', pin.listing_description, 'textarea')}
          {renderEditableField('Listing Status', pin.listing_status, 'select', [
            { label: 'Draft', value: 'draft' },
            { label: 'Active', value: 'active' },
            { label: 'Pending', value: 'pending' },
            { label: 'Sold', value: 'sold' },
            { label: 'Withdrawn', value: 'withdrawn' }
          ])}
          {renderEditableField('For Sale By', pin.for_sale_by, 'select', [
            { label: 'Owner', value: 'owner' },
            { label: 'Agent', value: 'agent' },
            { label: 'Builder', value: 'builder' }
          ])}
          {renderEditableField('Timeline', pin.timeline, 'select', [
            { label: 'Flexible', value: 'flexible' },
            { label: 'ASAP', value: 'asap' },
            { label: '30 Days', value: '30-days' },
            { label: '60 Days', value: '60-days' },
            { label: '90+ Days', value: '90-plus-days' }
          ])}
        </>
      )}

      {/* Financial Details */}
      {pin.is_for_sale && renderSection(
        'Financial Details',
        <ChartBarIcon className="h-5 w-5 text-purple-600" />,
        <>
          {renderEditableField('HOA Fees (monthly)', pin.hoa_fees, 'number')}
          {renderEditableField('Property Taxes (annual)', pin.property_taxes, 'number')}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium text-gray-900">Price per Sq Ft</span>
            </div>
            <span className="text-sm text-gray-600">
              {pin.listing_price && pin.square_feet 
                ? `$${Math.round(pin.listing_price / pin.square_feet)}`
                : 'Not calculated'
              }
            </span>
          </div>
        </>
      )}

      {/* Contact & Agent Information */}
      {pin.is_for_sale && renderSection(
        'Contact & Agent Information',
        <UserIcon className="h-5 w-5 text-indigo-600" />,
        <>
          {renderEditableField('Agent Name', pin.agent_name, 'text')}
          {renderEditableField('Agent Company', pin.agent_company, 'text')}
          {renderEditableField('Agent Phone', pin.agent_phone, 'text')}
          {renderEditableField('Agent Email', pin.agent_email, 'text')}
          {renderEditableField('Agent License', pin.agent_license, 'text')}
        </>
      )}

      {/* Property Features */}
      {renderSection(
        'Property Features',
        <WrenchScrewdriverIcon className="h-5 w-5 text-orange-600" />,
        <>
          {renderEditableField('Heating Type', pin.heating_type, 'text')}
          {renderEditableField('Cooling Type', pin.cooling_type, 'text')}
          {renderEditableField('Roof Type', pin.roof_type, 'text')}
          {renderEditableField('Exterior Material', pin.exterior_material, 'text')}
          {renderEditableField('Foundation Type', pin.foundation_type, 'text')}
          {renderEditableField('Garage Type', pin.garage_type, 'text')}
          {renderEditableField('Parking Spaces', pin.parking_spaces, 'number')}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-gray-900">Features</span>
            </div>
            <span className="text-sm text-gray-600">
              {pin.features && pin.features.length > 0 ? pin.features.join(', ') : 'None specified'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-gray-900">Amenities</span>
            </div>
            <span className="text-sm text-gray-600">
              {pin.amenities && pin.amenities.length > 0 ? pin.amenities.join(', ') : 'None specified'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-gray-900">Utilities Included</span>
            </div>
            <span className="text-sm text-gray-600">
              {pin.utilities_included && pin.utilities_included.length > 0 ? pin.utilities_included.join(', ') : 'None specified'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-gray-900">Flooring Type</span>
            </div>
            <span className="text-sm text-gray-600">
              {pin.flooring_type && pin.flooring_type.length > 0 ? pin.flooring_type.join(', ') : 'None specified'}
            </span>
          </div>
        </>
      )}

      {/* Schools & Location */}
      {renderSection(
        'Schools & Location',
        <AcademicCapIcon className="h-5 w-5 text-teal-600" />,
        <>
          {renderEditableField('School District', pin.school_district, 'text')}
          {renderEditableField('Elementary School', pin.elementary_school, 'text')}
          {renderEditableField('Middle School', pin.middle_school, 'text')}
          {renderEditableField('High School', pin.high_school, 'text')}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              <span className="text-sm font-medium text-gray-900">Walk Score</span>
            </div>
            <span className="text-sm text-gray-600">{pin.walk_score || 'Not available'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              <span className="text-sm font-medium text-gray-900">Transit Score</span>
            </div>
            <span className="text-sm text-gray-600">{pin.transit_score || 'Not available'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              <span className="text-sm font-medium text-gray-900">Bike Score</span>
            </div>
            <span className="text-sm text-gray-600">{pin.bike_score || 'Not available'}</span>
          </div>
        </>
      )}

      {/* Sharing & Privacy */}
      {renderSection(
        'Sharing & Privacy',
        <ShareIcon className="h-5 w-5 text-pink-600" />,
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${pin.is_public ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-900">Public Visibility</span>
            </div>
            <Badge variant={pin.is_public ? 'default' : 'secondary'}>
              {pin.is_public ? 'Public' : 'Private'}
            </Badge>
          </div>
          {renderEditableField('SEO Title', pin.seo_title, 'text')}
          {renderEditableField('SEO Description', pin.seo_description, 'textarea')}
          {renderEditableField('Custom Domain', pin.custom_domain, 'text')}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${pin.requires_terms_agreement ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-900">Requires Terms Agreement</span>
            </div>
            <Badge variant={pin.requires_terms_agreement ? 'default' : 'secondary'}>
              {pin.requires_terms_agreement ? 'Yes' : 'No'}
            </Badge>
          </div>
          {pin.requires_terms_agreement && renderEditableField('Custom Terms', pin.custom_terms, 'textarea')}
        </>
      )}

      {/* Listing Images */}
      {pin.listing_images && pin.listing_images.length > 0 && renderSection(
        'Listing Images',
        <TruckIcon className="h-5 w-5 text-indigo-600" />,
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <span className="text-sm font-medium text-gray-900">Image Count</span>
            </div>
            <span className="text-sm text-gray-600">{pin.listing_images.length} images</span>
          </div>
        </>
      )}

      {/* Market Data */}
      {(pin.price_per_sqft || pin.listing_date || pin.last_price_change || pin.price_history || pin.market_insights) && renderSection(
        'Market Data',
        <ChartBarIcon className="h-5 w-5 text-purple-600" />,
        <>
          {pin.price_per_sqft && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium text-gray-900">Price per Sq Ft</span>
              </div>
              <span className="text-sm text-gray-600">${pin.price_per_sqft}</span>
            </div>
          )}
          {pin.listing_date && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium text-gray-900">Listing Date</span>
              </div>
              <span className="text-sm text-gray-600">
                {new Date(pin.listing_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {pin.last_price_change && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium text-gray-900">Last Price Change</span>
              </div>
              <span className="text-sm text-gray-600">
                {new Date(pin.last_price_change).toLocaleDateString()}
              </span>
            </div>
          )}
          {pin.price_history && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium text-gray-900">Price History</span>
              </div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
          )}
          {pin.market_insights && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium text-gray-900">Market Insights</span>
              </div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
          )}
        </>
      )}

      {/* Analytics & Performance */}
      {renderSection(
        'Analytics & Performance',
        <EyeIcon className="h-5 w-5 text-gray-600" />,
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
              <span className="text-sm font-medium text-gray-900">Total Views</span>
            </div>
            <span className="text-sm text-gray-600">{propertyData.viewCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
              <span className="text-sm font-medium text-gray-900">Created</span>
            </div>
            <span className="text-sm text-gray-600">
              {new Date(pin.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
              <span className="text-sm font-medium text-gray-900">Last Modified</span>
            </div>
            <span className="text-sm text-gray-600">
              {new Date(pin.updated_at).toLocaleDateString()}
            </span>
          </div>
        </>
      )}

      {/* Error Display */}
      {editing.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <div className="flex items-center space-x-1">
            <XMarkIcon className="h-4 w-4" />
            <span className="font-medium">Error:</span>
          </div>
          <p className="mt-1">{editing.error}</p>
        </div>
      )}
    </div>
  );
}
