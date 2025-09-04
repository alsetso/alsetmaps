'use client';

import { useState, useEffect } from 'react';
import { FloatingTopbar } from '../../src/features/shared/components/layout/FloatingTopbar';
import { PinsService } from '../../src/features/property-management/services/pins-service';
import { Pin } from '../../src/features/property-management/services/pins-service';
import { Button } from '../../src/features/shared/components/ui/button';
import { TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../src/features/authentication/components/AuthProvider';

export default function MyPinsPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      loadPins();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError('Please sign in to view your pins');
    }
  }, [user, authLoading]);

  const loadPins = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading user pins...');
      
      const result = await PinsService.getUserPins();
      console.log('📌 PinsService result:', result);
      
      if (result.success && result.pins) {
        setPins(result.pins);
        setError(null);
        console.log('✅ Pins loaded successfully:', result.pins.length);
      } else {
        setError(result.error || 'Failed to load pins');
        console.log('❌ Failed to load pins:', result.error);
      }
    } catch (err) {
      console.error('❌ Error in loadPins:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pins');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePin = async (pinId: string) => {
    if (confirm('Are you sure you want to delete this pin?')) {
      try {
        const result = await PinsService.deletePin(pinId);
        if (result.success) {
          setPins(pins.filter(pin => pin.id !== pinId));
        } else {
          alert(result.error || 'Failed to delete pin');
        }
      } catch (err) {
        console.error('Failed to delete pin:', err);
        alert('Failed to delete pin');
      }
    }
  };

  const handleMarkAsSold = async (pinId: string) => {
    // TODO: Implement mark as sold functionality when the Pin interface supports status
    alert('Mark as sold functionality coming soon!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  if (authLoading || loading) {
    return (
      <>
        <FloatingTopbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FloatingTopbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <MapPinIcon className="h-12 w-12 text-blue-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">My Pins</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your property pins, market analysis, and real estate intentions all in one place
            </p>
          </div>

          {/* Stats - Only show when authenticated */}
          {user && !authLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{pins.length}</div>
                <div className="text-sm text-gray-600">Total Pins</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-2xl font-bold text-green-600">
                  {pins.filter(p => p.notes && p.notes.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">With Notes</div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error: {error}</p>
                <Button onClick={loadPins} variant="outline" className="text-red-600 border-red-300">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Pins Display */}
          {!user && !authLoading ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-200">
              <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in required</h3>
              <p className="text-gray-600 mb-6">
                Please sign in to view and manage your property pins.
              </p>
              <div className="space-x-4">
                <Button asChild>
                  <a href="/login">Sign In</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/register">Create Account</a>
                </Button>
              </div>
            </div>
          ) : pins.length === 0 && !error ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-200">
              <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No pins yet</h3>
              <p className="text-gray-600 mb-6">
                Start by searching for properties or creating your first pin to track real estate opportunities.
              </p>
              <div className="space-x-4">
                <Button asChild>
                  <a href="/">Search Properties</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Your Pins</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Images
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
                      <tr key={pin.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">📍</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {pin.name || 'Untitled Property'}
                              </div>
                              <div className="text-sm text-gray-500">
                                Pin #{pin.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            Coordinates
                          </div>
                          <div className="text-xs text-gray-500">
                            {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {pin.notes || 'No notes'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {pin.images && pin.images.length > 0 ? (
                              <span className="text-blue-600">{pin.images.length} image(s)</span>
                            ) : (
                              <span className="text-gray-500">No images</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(pin.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleDeletePin(pin.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-900 border-red-300"
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
