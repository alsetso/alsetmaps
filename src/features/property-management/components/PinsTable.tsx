'use client';

import { useState, useEffect } from 'react';
import { Pin } from '../types/pin';
import { PinsService } from '../services/pins-service';
import { TrashIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/features/shared/components/ui/button';

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
      const userPins = await PinsService.getUserPins();
      setPins(userPins);
      setError(null);
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
    const price = prompt('Enter the sold price:');
    if (price && !isNaN(Number(price))) {
      try {
        await PinsService.markPinAsSold(pinId, Number(price));
        await loadPins(); // Reload to get updated data
      } catch (err) {
        console.error('Failed to mark pin as sold:', err);
        alert('Failed to mark pin as sold');
      }
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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
                <div className="text-sm font-medium text-gray-900">{pin.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 max-w-xs truncate">{pin.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {pin.property_data.bedrooms && `${pin.property_data.bedrooms} bed`}
                  {pin.property_data.bathrooms && `, ${pin.property_data.bathrooms} bath`}
                  {pin.property_data.square_feet && `, ${pin.property_data.square_feet} sqft`}
                  {!pin.property_data.bedrooms && !pin.property_data.bathrooms && !pin.property_data.square_feet && 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {pin.property_data.price && formatPrice(pin.property_data.price)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  pin.is_sold 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {pin.is_sold ? 'Sold' : 'Active'}
                </span>
                {pin.is_sold && pin.sold_price && (
                  <div className="text-xs text-gray-500 mt-1">
                    {formatPrice(pin.sold_price)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(pin.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {!pin.is_sold && (
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
