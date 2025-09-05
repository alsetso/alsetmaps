'use client';

import { useState, useEffect } from 'react';
import { PinsService, Pin } from '../services/pins-service';
import { TrashIcon, CheckIcon, ShareIcon, EyeIcon, EyeSlashIcon, CogIcon } from '@heroicons/react/24/outline';
import { Button } from '@/features/shared/components/ui/button';
import { Badge } from '@/features/shared/components/ui/badge';
import { PinSharingModal } from './PinSharingModal';

export function PinsTable() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPins();
  }, []);

  const loadPins = async () => {
    try {
      setLoading(true);
      const result = await PinsService.getUserPins();
      if (result.success && result.pins) {
        setPins(result.pins);
        setError(null);
      } else {
        setError(result.error || 'Failed to load pins');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pins');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePin = async (pinId: string) => {
    if (confirm('Are you sure you want to delete this pin?')) {
      try {
        await PinsService.deletePin(pinId);
        setPins(pins.filter(pin => pin.id !== pinId));
      } catch (err) {
        console.error('Failed to delete pin:', err);
        alert('Failed to delete pin');
      }
    }
  };

  const handleMarkAsSold = async (pinId: string) => {
    // TODO: Implement markPinAsSold functionality
    console.log('Mark as sold functionality not yet implemented for pin:', pinId);
    alert('Mark as sold functionality coming soon!');
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error: {error}</p>
        <Button onClick={loadPins} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (pins.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No pins found. Search for an address to create your first pin!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Property
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sharing
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pins.map((pin) => (
            <tr key={pin.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{pin.name || 'Untitled'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                  {pin.search_history_id ? `Search ${pin.search_history_id.slice(0, 8)}` : 'No address'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  Property
                </div>
                <div className="text-sm text-gray-500">
                  {pin.status}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  pin.status === 'sold'
                    ? 'bg-green-100 text-green-800' 
                    : pin.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {pin.status}
                </span>
                {pin.status === 'sold' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Sold
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                  {pin.is_public ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <EyeSlashIcon className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  {pin.listing_price && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      For Sale
                    </Badge>
                  )}
                  {pin.requires_terms_agreement && (
                    <Badge variant="outline" className="text-xs text-blue-600">
                      Terms Required
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(pin.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <PinSharingModal 
                    pin={pin} 
                    onPinUpdated={(updatedPin) => {
                      setPins(pins.map(p => p.id === updatedPin.id ? updatedPin : p));
                    }}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <CogIcon className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    }
                  />
                  {pin.status !== 'sold' && (
                    <Button
                      onClick={() => handleMarkAsSold(pin.id)}
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Mark Sold
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeletePin(pin.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
