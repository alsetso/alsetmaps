'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  BuildingOfficeIcon,
  HomeIcon,
  StarIcon,
  FilterIcon
} from '@heroicons/react/24/outline';
import { BuyerIntentDisplay } from '@/features/marketplace-intents/types/buyer-intent';
import { BuyerIntentService } from '@/features/marketplace-intents/services/buyer-intent-service';

interface BuyerIntentDirectoryProps {
  className?: string;
}

export function BuyerIntentDirectory({ className }: BuyerIntentDirectoryProps) {
  const [buyerIntents, setBuyerIntents] = useState<BuyerIntentDisplay[]>([]);
  const [filteredIntents, setFilteredIntents] = useState<BuyerIntentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyerType, setSelectedBuyerType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showContactModal, setShowContactModal] = useState<string | null>(null);

  useEffect(() => {
    loadBuyerIntents();
  }, []);

  useEffect(() => {
    filterIntents();
  }, [buyerIntents, searchTerm, selectedBuyerType, selectedLocation]);

  const loadBuyerIntents = async () => {
    try {
      setLoading(true);
      const intents = await BuyerIntentService.getPublicBuyerIntents();
      setBuyerIntents(intents);
    } catch (error) {
      console.error('Error loading buyer intents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIntents = () => {
    let filtered = buyerIntents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(intent => 
        intent.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intent.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intent.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intent.propertyTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        intent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by buyer type
    if (selectedBuyerType !== 'all') {
      filtered = filtered.filter(intent => intent.buyerType === selectedBuyerType);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(intent => 
        intent.city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        intent.state.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredIntents(filtered);
  };

  const getBuyerTypeIcon = (buyerType: string) => {
    switch (buyerType) {
      case 'family':
        return <HomeIcon className="w-5 h-5" />;
      case 'investor':
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'wholesaler':
        return <MagnifyingGlassIcon className="w-5 h-5" />;
      case 'developer':
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'agent':
        return <UserIcon className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

  const getBuyerTypeColor = (buyerType: string) => {
    switch (buyerType) {
      case 'family':
        return 'bg-blue-100 text-blue-800';
      case 'investor':
        return 'bg-green-100 text-green-800';
      case 'wholesaler':
        return 'bg-purple-100 text-purple-800';
      case 'developer':
        return 'bg-orange-100 text-orange-800';
      case 'agent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (min?: number, max: number) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    return `Up to $${max.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Buyer Intent Directory
        </h2>
        <p className="text-lg text-gray-600">
          Discover what other buyers are looking for and connect with potential matches
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search buyers, locations, property types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Buyer Type Filter */}
          <select
            value={selectedBuyerType}
            onChange={(e) => setSelectedBuyerType(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Buyer Types</option>
            <option value="family">Family</option>
            <option value="investor">Investor</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="developer">Developer</option>
            <option value="agent">Agent</option>
            <option value="other">Other</option>
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Locations</option>
            {Array.from(new Set(buyerIntents.map(intent => intent.city))).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center text-sm text-gray-600">
            {filteredIntents.length} buyer intent{filteredIntents.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Buyer Intents Grid */}
      {filteredIntents.length === 0 ? (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No buyer intents found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or check back later for new intents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntents.map((intent) => (
            <Card key={intent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getBuyerTypeIcon(intent.buyerType)}
                    <div>
                      <CardTitle className="text-lg">{intent.buyerName}</CardTitle>
                      <CardDescription className="text-sm">
                        {intent.city}, {intent.state}
                      </CardDescription>
                    </div>
                  </div>
                  {intent.isFeatured && (
                    <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBuyerTypeColor(intent.buyerType)}`}>
                    {intent.buyerType}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(intent.urgencyLevel)}`}>
                    {intent.urgencyLevel} urgency
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Property Types */}
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {intent.propertyTypes.join(', ')}
                  </span>
                </div>

                {/* Budget */}
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatBudget(intent.budgetRange.min, intent.budgetRange.max)}
                  </span>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Timeline: {intent.timeline}
                  </span>
                </div>

                {/* Location Scope */}
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {intent.locationScope.replace('_', ' ')} search
                    {intent.specificAddress && `: ${intent.specificAddress}`}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {intent.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {intent.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{intent.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    {intent.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    {intent.contactCount} contacts
                  </span>
                  <span className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    {intent.matchCount} matches
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowContactModal(intent.id)}
                  >
                    Contact Buyer
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // TODO: Navigate to detailed view
                      console.log('View details for:', intent.id);
                    }}
                  >
                    View Details
                  </Button>
                </div>

                {/* Expiry Info */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                  Expires {formatDate(intent.expiresAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Contact Buyer</h3>
            <p className="text-gray-600 mb-4">
              This will send a message to the buyer about their intent.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowContactModal(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implement contact functionality
                  console.log('Contact buyer:', showContactModal);
                  setShowContactModal(null);
                }}
                className="flex-1"
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
