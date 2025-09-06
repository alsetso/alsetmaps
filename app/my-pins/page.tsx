'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { PinsService, Pin } from '@/features/property-management/services/pins-service';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { 
  MapPinIcon,
  TrashIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  PlusIcon,
  CalendarIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  PencilIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

type ViewMode = 'grid' | 'table';
type SortOption = 'newest' | 'oldest' | 'name' | 'status';
type FilterOption = 'all' | 'public' | 'private' | 'active' | 'sold' | 'pending';

export default function MyPinsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedPins, setSelectedPins] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load user pins
  const loadPins = useCallback(async () => {
    if (!user || authLoading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const pinsResult = await PinsService.getUserPins();
      if (pinsResult.success && pinsResult.pins) {
        setPins(pinsResult.pins);
      } else {
        setError(pinsResult.error || 'Failed to load pins');
      }
    } catch (err) {
      console.error('Error loading pins:', err);
      setError('Failed to load pins');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadPins();
  }, [loadPins]);

  // Filter and sort pins
  const getFilteredAndSortedPins = () => {
    let filtered = pins.filter(pin => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = pin.name?.toLowerCase().includes(query);
        const matchesNotes = pin.notes?.toLowerCase().includes(query);
        if (!matchesName && !matchesNotes) return false;
      }

      // Status/visibility filter
      switch (filter) {
        case 'public':
          return pin.is_public === true;
        case 'private':
          return pin.is_public === false;
        case 'active':
          return pin.status === 'active';
        case 'sold':
          return pin.status === 'sold';
        case 'pending':
          return pin.status === 'pending';
        default:
          return true;
      }
    });

    // Sort pins
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

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
    const filteredPins = getFilteredAndSortedPins();
    setSelectedPins(filteredPins.map(pin => pin.id));
  };

  const clearSelection = () => {
    setSelectedPins([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPins = getFilteredAndSortedPins();

  if (authLoading || loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your pins...</p>
          </div>
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
            <p className="text-gray-600 mb-6">You need to be signed in to view your pins.</p>
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
                <h1 className="text-3xl font-bold text-gray-900">My Pins</h1>
                <p className="mt-2 text-gray-600">Manage and organize your property pins</p>
              </div>
              <div className="flex space-x-3">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    View Map
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats and Controls */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Pins</p>
                      <p className="text-2xl font-bold text-gray-900">{pins.length}</p>
                    </div>
                    <MapPinIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Public Pins</p>
                      <p className="text-2xl font-bold text-green-600">{pins.filter(p => p.is_public).length}</p>
                    </div>
                    <GlobeAltIcon className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Pins</p>
                      <p className="text-2xl font-bold text-blue-600">{pins.filter(p => p.status === 'active').length}</p>
                    </div>
                    <CheckIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">With Notes</p>
                      <p className="text-2xl font-bold text-purple-600">{pins.filter(p => p.notes && p.notes.length > 0).length}</p>
                    </div>
                    <PencilIcon className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                  {/* Search */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search pins by name or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center space-x-3">
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
                    <div className="relative">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                      >
                        <FunnelIcon className="h-4 w-4" />
                        <span>Filter</span>
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>

                      {showFilters && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <div className="p-2">
                            <div className="space-y-1">
                              {[
                                { value: 'all', label: 'All Pins' },
                                { value: 'public', label: 'Public' },
                                { value: 'private', label: 'Private' },
                                { value: 'active', label: 'Active' },
                                { value: 'sold', label: 'Sold' },
                                { value: 'pending', label: 'Pending' }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setFilter(option.value as FilterOption);
                                    setShowFilters(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                                    filter === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name A-Z</option>
                      <option value="status">Status</option>
                    </select>

                    {/* Bulk Actions */}
                    {selectedPins.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{selectedPins.length} selected</span>
                        <Button
                          onClick={handleBulkDelete}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          onClick={clearSelection}
                          variant="outline"
                          size="sm"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <Link href="/">
                      <Button size="sm">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Pin
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Error: {error}</p>
                  <Button onClick={loadPins} variant="outline" className="text-red-600 border-red-300">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pins Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5" />
                  <span>Your Pins ({filteredPins.length})</span>
                </CardTitle>
                {filteredPins.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPins.length === filteredPins.length && filteredPins.length > 0}
                      onChange={selectAllPins}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Select All</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredPins.length === 0 ? (
                <div className="text-center py-12">
                  <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || filter !== 'all' ? 'No pins match your criteria' : 'No pins found'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || filter !== 'all' 
                      ? "Try adjusting your search or filter criteria."
                      : "Start by searching for properties or creating your first pin."
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
                  {filteredPins.map((pin) => (
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
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/pin/${pin.id}`}
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
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {pin.name || 'Untitled Property'}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(pin.created_at)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {pin.is_public ? (
                            <GlobeAltIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <LockClosedIcon className="h-4 w-4 text-gray-500" />
                          )}
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pin.status || 'active')}`}>
                          {pin.status || 'active'}
                        </span>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/pin/${pin.id}`}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <ShareIcon className="h-4 w-4" />
                          </Button>
                        </div>
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
                            checked={selectedPins.length === filteredPins.length && filteredPins.length > 0}
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
                      {filteredPins.map((pin) => (
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
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              pin.is_public 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pin.is_public ? 'Public' : 'Private'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pin.status || 'active')}`}>
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
                                onClick={() => window.location.href = `/pin/${pin.id}`}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <ShareIcon className="h-4 w-4" />
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
        </div>
      </div>
    </SharedLayout>
  );
}
