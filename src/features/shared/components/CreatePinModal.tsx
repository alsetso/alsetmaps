'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { PinsService } from '@/features/property-management/services/pins-service';
import { useAuth } from '@/features/authentication/components/AuthProvider';

interface CreatePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPinCreated?: () => void;
  latitude: number;
  longitude: number;
  address: string;
}

export function CreatePinModal({ 
  isOpen, 
  onClose, 
  onPinCreated, 
  latitude, 
  longitude, 
  address 
}: CreatePinModalProps) {
  const { user } = useAuth();
  
  // Form state
  const [pinName, setPinName] = useState('');
  const [notes, setNotes] = useState('');
  
  // Loading and data state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && address) {
      setPinName(address);
      setError(null);
    }
  }, [isOpen, address]);

  // Create pin directly
  const handleCreatePin = async () => {
    if (!pinName.trim()) {
      setError('Pin name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create the pin directly
      const pinData = {
        name: pinName.trim(),
        latitude,
        longitude,
        notes: notes.trim() || undefined,
      };

      const result = await PinsService.createPin(pinData);

      if (result.success) {
        // Clear temporary pin from map
        if (window.clearTempPin) {
          window.clearTempPin();
        }

        // Call success callback
        onPinCreated?.();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to create pin');
      }
    } catch (error) {
      console.error('Error creating pin:', error);
      setError(error instanceof Error ? error.message : 'Failed to create pin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Clear temporary pin from map
    if (window.clearTempPin) {
      window.clearTempPin();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create Pin
              </h2>
              <p className="text-sm text-gray-500">
                Add details for your new property pin
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Location</h3>
            <p className="text-sm text-gray-600 mb-1">{address}</p>
            <p className="text-xs text-gray-500">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>

          {/* Pin Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pin Name *
            </label>
            <input
              type="text"
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
              placeholder="Enter pin name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this location..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleCreatePin}
              disabled={isLoading || !pinName.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <MapPinIcon className="w-4 h-4" />
                  Create Pin
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
}
