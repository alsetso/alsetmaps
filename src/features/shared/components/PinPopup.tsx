'use client';

import { useState } from 'react';
import { MapPinIcon, EyeIcon, GlobeAltIcon, LockClosedIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface Pin {
  id: string;
  account_id: string;
  search_history_id?: string;
  latitude: number;
  longitude: number;
  name: string;
  images?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
  is_public?: boolean;
  search_history?: {
    id: string;
    search_address: string;
    search_type: 'basic' | 'smart';
    search_tier: 'basic' | 'smart';
    credits_consumed: number;
    smart_data?: any;
    created_at: string;
  };
}

interface PinPopupProps {
  pin: Pin | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProperty: (pin: Pin) => void;
  position?: {
    x: number;
    y: number;
  };
}

export function PinPopup({ pin, isOpen, onClose, onViewProperty, position }: PinPopupProps) {
  if (!isOpen || !pin) return null;

  const getVisibilityIcon = (isPublic?: boolean) => {
    if (isPublic === undefined) {
      return <LockClosedIcon className="w-4 h-4 text-gray-500" />;
    }
    return isPublic ? (
      <GlobeAltIcon className="w-4 h-4 text-green-500" />
    ) : (
      <LockClosedIcon className="w-4 h-4 text-gray-500" />
    );
  };

  const getVisibilityText = (isPublic?: boolean) => {
    if (isPublic === undefined) {
      return 'Private';
    }
    return isPublic ? 'Public' : 'Private';
  };

  const getAddress = () => {
    if (pin.search_history?.search_address) {
      return pin.search_history.search_address;
    }
    return `${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}`;
  };

  const handleViewProperty = () => {
    onViewProperty(pin);
    onClose();
  };

  const popupStyle = position ? {
    position: 'absolute' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000,
  } : {};

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={popupStyle}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {pin.name || 'Untitled Property'}
                </h3>
                <p className="text-sm text-gray-500">
                  Pin #{pin.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Address</p>
                <p className="text-sm text-gray-600">{getAddress()}</p>
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-start gap-3">
              {getVisibilityIcon(pin.is_public)}
              <div>
                <p className="text-sm font-medium text-gray-900">Visibility</p>
                <p className="text-sm text-gray-600">{getVisibilityText(pin.is_public)}</p>
              </div>
            </div>

            {/* Search Type (if available) */}
            {pin.search_history?.search_type && (
              <div className="flex items-start gap-3">
                <UserGroupIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Search Type</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {pin.search_history.search_type} Search
                  </p>
                </div>
              </div>
            )}

            {/* Notes (if available) */}
            {pin.notes && (
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Notes</p>
                  <p className="text-sm text-gray-600">{pin.notes}</p>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-600">
                  {new Date(pin.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleViewProperty}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              View Property
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
