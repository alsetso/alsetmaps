'use client';

import { useState } from 'react';
import { XMarkIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface ForSalePin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  images?: string[];
  notes?: string;
  is_public: boolean;
  share_token?: string;
  view_count?: number;
  last_viewed_at?: string;
  seo_title?: string;
  seo_description?: string;
  share_settings?: any;
  created_at: string;
  updated_at?: string;
  // For sale listing fields
  is_for_sale?: boolean;
  listing_price?: number;
  property_type?: string;
  listing_description?: string;
  listing_status?: string;
  for_sale_by?: string;
  agent_name?: string;
  agent_company?: string;
  agent_phone?: string;
  agent_email?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
}

interface ForSalePinPopupProps {
  pin: ForSalePin | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProperty: (pin: ForSalePin) => void;
}

export function ForSalePinPopup({ pin, isOpen, onClose, onViewProperty }: ForSalePinPopupProps) {
  if (!isOpen || !pin) return null;

  const formatPrice = (price?: number) => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatBathrooms = (bathrooms?: number) => {
    if (!bathrooms) return 'N/A';
    if (bathrooms === Math.floor(bathrooms)) {
      return `${bathrooms} bath${bathrooms !== 1 ? 's' : ''}`;
    }
    return `${bathrooms} bath${bathrooms !== 1 ? 's' : ''}`;
  };

  const formatBedrooms = (bedrooms?: number) => {
    if (!bedrooms) return 'N/A';
    return `${bedrooms} bed${bedrooms !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">For Sale</h3>
              <p className="text-sm text-gray-500">{pin.property_type || 'Property'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Property Image */}
          {pin.images && pin.images.length > 0 && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={pin.images[0]}
                alt={pin.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Property Details */}
          <div className="space-y-3">
            <h4 className="text-xl font-semibold text-gray-900">{pin.name}</h4>
            
            {/* Price */}
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(pin.listing_price)}
              </span>
            </div>

            {/* Property Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-medium">{formatBedrooms(pin.bedrooms)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{formatBathrooms(pin.bathrooms)}</span>
              </div>
              {pin.square_feet && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">{pin.square_feet.toLocaleString()} sq ft</span>
                </div>
              )}
            </div>

            {/* Description */}
            {pin.listing_description && (
              <p className="text-gray-600 text-sm line-clamp-3">
                {pin.listing_description}
              </p>
            )}

            {/* Agent Info */}
            {pin.agent_name && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Agent:</span> {pin.agent_name}
                  {pin.agent_company && ` - ${pin.agent_company}`}
                </p>
                {pin.agent_phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {pin.agent_phone}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onViewProperty(pin)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            View Property Details
          </button>
        </div>
      </div>
    </div>
  );
}

