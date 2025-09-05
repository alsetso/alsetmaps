'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/features/shared/components/ui/dialog';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Textarea } from '@/features/shared/components/ui/textarea';
import { Switch } from '@/features/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import { 
  ShareIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CogIcon,
  LinkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { PinSharingService, PinSharingSettings } from '../services/pin-sharing-service';
import { PinsService, Pin } from '../services/pins-service';

interface PinSharingModalProps {
  pin: Pin;
  onPinUpdated: (updatedPin: Pin) => void;
  trigger?: React.ReactNode;
}

interface ForSaleListingData {
  title: string;
  description: string;
  listing_price: string;
  property_type: string;
  timeline: string;
  for_sale_by: string;
  images: string[];
  contact_info: {
    phone: string;
    email: string;
    preferred_method: string;
  };
  agent_name?: string;
  agent_company?: string;
  agent_phone?: string;
  agent_email?: string;
}

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
  { value: 'owner', label: 'For Sale By Owner (FSBO)' },
  { value: 'agent', label: 'Listed with Agent' },
  { value: 'wholesaler', label: 'Wholesale' },
];

export function PinSharingModal({ pin, onPinUpdated, trigger }: PinSharingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Sharing settings
  const [isPublic, setIsPublic] = useState(pin.is_public || false);
  const [seoTitle, setSeoTitle] = useState(pin.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(pin.seo_description || '');
  const [customDomain, setCustomDomain] = useState(pin.custom_domain || '');
  const [allowInquiries, setAllowInquiries] = useState(true);
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'both'>('email');
  const [showViewCount, setShowViewCount] = useState(true);
  
  // Terms settings
  const [requiresTermsAgreement, setRequiresTermsAgreement] = useState(pin.requires_terms_agreement || false);
  const [customTerms, setCustomTerms] = useState(pin.custom_terms || '');
  
  // For sale listing
  const [hasForSaleListing, setHasForSaleListing] = useState(false);
  const [forSaleData, setForSaleData] = useState<ForSaleListingData>({
    title: pin.name || '',
    description: pin.notes || '',
    listing_price: pin.listing_price?.toString() || '',
    property_type: pin.property_type || 'single-family',
    timeline: pin.timeline || 'flexible',
    for_sale_by: pin.for_sale_by || 'owner',
    images: pin.images || [],
    contact_info: {
      phone: '',
      email: '',
      preferred_method: 'email'
    }
  });

  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Check if pin has for sale listing
      setHasForSaleListing(!!(pin.listing_price || pin.property_type || pin.for_sale_by));
      
      // Generate share URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setShareUrl(`${baseUrl}/shared/property/${pin.id}`);
      
      // Load existing share settings
      if (pin.share_settings) {
        const settings = pin.share_settings as any;
        setAllowInquiries(settings.allowInquiries ?? true);
        setContactMethod(settings.contactMethod ?? 'email');
        setShowViewCount(settings.showViewCount ?? true);
      }
    }
  }, [isOpen, pin]);

  const handleSaveSharingSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const sharingSettings: Partial<PinSharingSettings> = {
        isPublic,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        customDomain: customDomain || undefined,
        allowInquiries,
        contactMethod,
        showViewCount
      };

      const result = await PinSharingService.updatePinSharingSettings(pin.id, sharingSettings);
      
      if (result.success) {
        setSuccess('Sharing settings updated successfully!');
        
        // Update terms if changed
        if (requiresTermsAgreement !== pin.requires_terms_agreement || customTerms !== pin.custom_terms) {
          await fetch(`/api/pins/${pin.id}/terms`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requiresTermsAgreement,
              customTerms: customTerms || undefined
            })
          });
        }

        // Update for sale listing if needed
        if (hasForSaleListing && forSaleData.title && forSaleData.listing_price) {
          await fetch('/api/for-sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pin_id: pin.id,
              ...forSaleData,
              listing_price: parseInt(forSaleData.listing_price)
            })
          });
        }

        // Refresh pin data
        const updatedPin = await PinsService.getPinById(pin.id);
        if (updatedPin.success && updatedPin.pin) {
          onPinUpdated(updatedPin.pin);
        }
        
        setTimeout(() => setIsOpen(false), 1500);
      } else {
        setError(result.error || 'Failed to update sharing settings');
      }
    } catch (err) {
      console.error('Error updating sharing settings:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSuccess('Share URL copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to copy URL to clipboard');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ShareIcon className="h-4 w-4 mr-2" />
            Manage Sharing
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShareIcon className="h-5 w-5 mr-2" />
            Manage Property Sharing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Share URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sharing Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isPublic ? (
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
                    {isPublic ? 'Property is publicly accessible' : 'Property is private'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="w-80 text-sm"
                  />
                  <Button size="sm" onClick={copyShareUrl}>
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Sharing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                Basic Sharing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic">Make Property Public</Label>
                  <p className="text-sm text-gray-600">
                    Allow anyone with the link to view this property
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom title for search engines"
                  />
                </div>
                <div>
                  <Label htmlFor="customDomain">Custom Domain</Label>
                  <Input
                    id="customDomain"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="yourdomain.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Description for search engines and social media"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact & Interaction Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact & Interaction Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowInquiries">Allow Inquiries</Label>
                  <p className="text-sm text-gray-600">
                    Let viewers contact you about this property
                  </p>
                </div>
                <Switch
                  id="allowInquiries"
                  checked={allowInquiries}
                  onCheckedChange={setAllowInquiries}
                />
              </div>

              {allowInquiries && (
                <div>
                  <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                  <Select value={contactMethod} onValueChange={(value: any) => setContactMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="phone">Phone Only</SelectItem>
                      <SelectItem value="both">Email & Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showViewCount">Show View Count</Label>
                  <p className="text-sm text-gray-600">
                    Display how many people have viewed this property
                  </p>
                </div>
                <Switch
                  id="showViewCount"
                  checked={showViewCount}
                  onCheckedChange={setShowViewCount}
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms Agreement Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Terms Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requiresTermsAgreement">Require Terms Agreement</Label>
                  <p className="text-sm text-gray-600">
                    Viewers must agree to terms before accessing property details
                  </p>
                </div>
                <Switch
                  id="requiresTermsAgreement"
                  checked={requiresTermsAgreement}
                  onCheckedChange={setRequiresTermsAgreement}
                />
              </div>

              {requiresTermsAgreement && (
                <div>
                  <Label htmlFor="customTerms">Custom Terms & Conditions</Label>
                  <Textarea
                    id="customTerms"
                    value={customTerms}
                    onChange={(e) => setCustomTerms(e.target.value)}
                    placeholder="Enter your custom terms and conditions that viewers must agree to..."
                    rows={6}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    This text will be shown to viewers before they can access the property details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* For Sale Listing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                For Sale Listing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="hasForSaleListing">Create For Sale Listing</Label>
                  <p className="text-sm text-gray-600">
                    Add this property to the marketplace as a for-sale listing
                  </p>
                </div>
                <Switch
                  id="hasForSaleListing"
                  checked={hasForSaleListing}
                  onCheckedChange={setHasForSaleListing}
                />
              </div>

              {hasForSaleListing && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="listingTitle">Listing Title</Label>
                      <Input
                        id="listingTitle"
                        value={forSaleData.title}
                        onChange={(e) => setForSaleData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Beautiful 3BR Home"
                      />
                    </div>
                    <div>
                      <Label htmlFor="listingPrice">Listing Price</Label>
                      <Input
                        id="listingPrice"
                        type="number"
                        value={forSaleData.listing_price}
                        onChange={(e) => setForSaleData(prev => ({ ...prev, listing_price: e.target.value }))}
                        placeholder="500000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="listingDescription">Description</Label>
                    <Textarea
                      id="listingDescription"
                      value={forSaleData.description}
                      onChange={(e) => setForSaleData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your property..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select 
                        value={forSaleData.property_type} 
                        onValueChange={(value) => setForSaleData(prev => ({ ...prev, property_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeline">Timeline</Label>
                      <Select 
                        value={forSaleData.timeline} 
                        onValueChange={(value) => setForSaleData(prev => ({ ...prev, timeline: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timelineOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="forSaleBy">For Sale By</Label>
                      <Select 
                        value={forSaleData.for_sale_by} 
                        onValueChange={(value) => setForSaleData(prev => ({ ...prev, for_sale_by: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {forSaleByOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactPhone">Phone</Label>
                        <Input
                          id="contactPhone"
                          value={forSaleData.contact_info.phone}
                          onChange={(e) => setForSaleData(prev => ({ 
                            ...prev, 
                            contact_info: { ...prev.contact_info, phone: e.target.value }
                          }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={forSaleData.contact_info.email}
                          onChange={(e) => setForSaleData(prev => ({ 
                            ...prev, 
                            contact_info: { ...prev.contact_info, email: e.target.value }
                          }))}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agent Information (conditional) */}
                  {forSaleData.for_sale_by === 'agent' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        Agent Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="agentName">Agent Name</Label>
                          <Input
                            id="agentName"
                            value={forSaleData.agent_name || ''}
                            onChange={(e) => setForSaleData(prev => ({ ...prev, agent_name: e.target.value }))}
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <Label htmlFor="agentCompany">Company</Label>
                          <Input
                            id="agentCompany"
                            value={forSaleData.agent_company || ''}
                            onChange={(e) => setForSaleData(prev => ({ ...prev, agent_company: e.target.value }))}
                            placeholder="ABC Realty"
                          />
                        </div>
                        <div>
                          <Label htmlFor="agentPhone">Agent Phone</Label>
                          <Input
                            id="agentPhone"
                            value={forSaleData.agent_phone || ''}
                            onChange={(e) => setForSaleData(prev => ({ ...prev, agent_phone: e.target.value }))}
                            placeholder="(555) 987-6543"
                          />
                        </div>
                        <div>
                          <Label htmlFor="agentEmail">Agent Email</Label>
                          <Input
                            id="agentEmail"
                            type="email"
                            value={forSaleData.agent_email || ''}
                            onChange={(e) => setForSaleData(prev => ({ ...prev, agent_email: e.target.value }))}
                            placeholder="agent@company.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSharingSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
