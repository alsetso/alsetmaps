'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { PinsService, Pin } from '@/features/property-management/services/pins-service';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { AccountSetupService } from '@/features/authentication/services/account-setup-service';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  UserIcon,
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  MapPinIcon,
  TrashIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  PlusIcon,
  CalendarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedPins, setSelectedPins] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold'>('all');

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user || authLoading) return;
    
    try {
      setLoading(true);
      
      // Load pins
      const pinsResult = await PinsService.getUserPins();
      if (pinsResult.success && pinsResult.pins) {
        setPins(pinsResult.pins);
      } else {
        setError(pinsResult.error || 'Failed to load pins');
      }
      
      // Load credits
      const creditBalance = await AccountSetupService.getCreditBalance();
      if (creditBalance) {
        setCredits(creditBalance.availableCredits);
      }
      
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleDeletePin = async (pinId: string) => {
    if (confirm('Are you sure you want to delete this pin?')) {
      try {
        const result = await PinsService.deletePin(pinId);
        if (result.success) {
          setPins(pins.filter(pin => pin.id !== pinId));
          setSelectedPins(selectedPins.filter(id => id !== pinId));
        } else {
          alert(result.error || 'Failed to delete pin');
        }
      } catch (err) {
        console.error('Failed to delete pin:', err);
        alert('Failed to delete pin');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPins.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedPins.length} pins?`)) {
      try {
        const deletePromises = selectedPins.map(pinId => PinsService.deletePin(pinId));
        await Promise.all(deletePromises);
        
        setPins(pins.filter(pin => !selectedPins.includes(pin.id)));
        setSelectedPins([]);
      } catch (err) {
        console.error('Failed to delete pins:', err);
        alert('Failed to delete some pins');
      }
    }
  };

  const togglePinSelection = (pinId: string) => {
    setSelectedPins(prev => 
      prev.includes(pinId) 
        ? prev.filter(id => id !== pinId)
        : [...prev, pinId]
    );
  };

  const selectAllPins = () => {
    const filteredPins = getFilteredPins();
    setSelectedPins(filteredPins.map(pin => pin.id));
  };

  const getFilteredPins = () => {
    return pins.filter(pin => {
      if (filterStatus === 'all') return true;
      return pin.status === filterStatus;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const quickStats = [
    { title: 'Total Credits', value: credits?.toString() || '0', icon: CreditCardIcon, color: 'text-blue-600' },
    { title: 'Total Pins', value: pins.length.toString(), icon: MapPinIcon, color: 'text-green-600' },
    { title: 'Active Pins', value: pins.filter(p => p.status === 'active').length.toString(), icon: BookmarkIcon, color: 'text-purple-600' },
    { title: 'With Notes', value: pins.filter(p => p.notes && p.notes.length > 0).length.toString(), icon: UserIcon, color: 'text-orange-600' }
  ];

  const recentActivity = pins
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(pin => ({
      action: 'Pin Created',
      details: pin.name || 'Untitled Property',
      time: formatDate(pin.created_at),
      type: 'save' as const
    }));

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'search': return <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />;
      case 'save': return <MapPinIcon className="h-4 w-4 text-green-500" />;
      case 'intent': return <UserIcon className="h-4 w-4 text-purple-500" />;
      case 'credits': return <CreditCardIcon className="h-4 w-4 text-orange-500" />;
      default: return <BellIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (authLoading || loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SharedLayout>
    );
  }

  if (!user) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
            <p className="text-gray-600 mb-6">You need to be signed in to access your dashboard.</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your property pins, search history, and account.</p>
              </div>
              <div className="flex space-x-3">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    View Map
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <CogIcon className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <Button onClick={loadUserData} variant="outline" className="text-red-600 border-red-300">
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pin Management Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5" />
                    <span>Property Pins</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {/* View Mode Toggle */}
                    <div className="flex rounded-lg border border-gray-200">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-l-lg transition-colors ${
                          viewMode === 'grid' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Squares2X2Icon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-r-lg transition-colors ${
                          viewMode === 'table' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <ListBulletIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Filter Dropdown */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'sold')}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Pins</option>
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                    </select>

                    {/* Bulk Actions */}
                    {selectedPins.length > 0 && (
                      <Button
                        onClick={handleBulkDelete}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete ({selectedPins.length})
                      </Button>
                    )}

                    <Link href="/">
                      <Button size="sm">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Pin
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {getFilteredPins().length === 0 ? (
                  <div className="text-center py-12">
                    <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pins found</h3>
                    <p className="text-gray-500 mb-6">
                      {filterStatus === 'all' 
                        ? "Start by searching for properties or creating your first pin."
                        : `No ${filterStatus} pins found.`
                      }
                    </p>
                    <Link href="/">
                      <Button>
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        Go to Map
                      </Button>
                    </Link>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredPins().map((pin) => (
                      <div key={pin.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedPins.includes(pin.id)}
                              onChange={() => togglePinSelection(pin.id)}
                              className="rounded border-gray-300"
                            />
                            <MapPinIcon className="h-5 w-5 text-blue-500" />
                          </div>
                          <Button
                            onClick={() => handleDeletePin(pin.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {pin.name || 'Untitled Property'}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(pin.created_at)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              pin.is_public 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pin.is_public ? 'Public' : 'Private'}
                            </span>
                          </div>
                          
                          {pin.notes && (
                            <div className="flex items-start space-x-2">
                              <span className="font-medium">Notes:</span>
                              <span className="line-clamp-2">{pin.notes}</span>
                            </div>
                          )}
                          
                          {pin.images && pin.images.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <PhotoIcon className="h-4 w-4" />
                              <span>{pin.images.length} image(s)</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            pin.status === 'sold'
                              ? 'bg-green-100 text-green-800' 
                              : pin.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pin.status || 'active'}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/property/${pin.id}`}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedPins.length === getFilteredPins().length && getFilteredPins().length > 0}
                              onChange={selectAllPins}
                              className="rounded border-gray-300"
                            />
                          </th>
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
                            Visibility
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
                        {getFilteredPins().map((pin) => (
                          <tr key={pin.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedPins.includes(pin.id)}
                                onChange={() => togglePinSelection(pin.id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <MapPinIcon className="h-5 w-5 text-blue-500 mr-3" />
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
                              <div className="text-sm text-gray-900">
                                {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {pin.notes || 'No notes'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                pin.is_public 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {pin.is_public ? 'Public' : 'Private'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                pin.status === 'sold'
                                  ? 'bg-green-100 text-green-800' 
                                  : pin.status === 'active'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {pin.status || 'active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(pin.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.location.href = `/property/${pin.id}`}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeletePin(pin.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
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
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BellIcon className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.details}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/">
                    <Button className="w-full justify-start" variant="outline">
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      Search Properties
                    </Button>
                  </Link>
                  <Link href="/buy">
                    <Button className="w-full justify-start" variant="outline">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Create Buyer Intent
                    </Button>
                  </Link>
                  <Link href="/search-history">
                    <Button className="w-full justify-start" variant="outline">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      View Search History
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subscription</span>
                    <span className="text-sm font-medium text-green-600">Free Plan</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Credits Remaining</span>
                    <span className="text-sm font-medium text-blue-600">{credits || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Pins</span>
                    <span className="text-sm text-gray-900">{pins.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
