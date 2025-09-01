'use client';

import { useState } from 'react';
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/features/shared/components/ui/button';
import { ZillowSearchResult } from '@/features/property-management/types/pin';

interface PropertyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyData: ZillowSearchResult | null;
  onConfirm: (propertyData: ZillowSearchResult) => void;
  onReject: () => void;
  loading?: boolean;
}

export function PropertyConfirmationModal({
  isOpen,
  onClose,
  propertyData,
  onConfirm,
  onReject,
  loading = false
}: PropertyConfirmationModalProps) {
  const [showRawData, setShowRawData] = useState(false);

  if (!isOpen || !propertyData) return null;

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Property Found
              </h3>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Is this your property? Confirm to add it to your pins.
            </p>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            {/* Address */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {propertyData.address}
              </h4>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Price:</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPrice(propertyData.price)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Bedrooms:</span>
                  <p className="text-base text-gray-900">{propertyData.bedrooms || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Bathrooms:</span>
                  <p className="text-base text-gray-900">{propertyData.bathrooms || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Square Feet:</span>
                  <p className="text-base text-gray-900">{formatNumber(propertyData.square_feet)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Lot Size:</span>
                  <p className="text-base text-gray-900">{formatNumber(propertyData.lot_size)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Year Built:</span>
                  <p className="text-base text-gray-900">{propertyData.year_built || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Property Type:</span>
                  <p className="text-base text-gray-900">{propertyData.property_type || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Zestimate:</span>
                  <p className="text-base text-gray-900">{formatPrice(propertyData.zestimate)}</p>
                </div>
              </div>
            </div>

            {/* Raw Data Toggle */}
            {propertyData.raw_data && (
              <div className="mb-6">
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {showRawData ? 'Hide' : 'Show'} Raw API Data
                </button>
                {showRawData && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                      {JSON.stringify(propertyData.raw_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => onConfirm(propertyData)}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                {loading ? 'Confirming...' : 'Yes, This is My Property'}
              </Button>
              <Button
                onClick={onReject}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                No, Not My Property
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
