'use client';

import { useState, useCallback } from 'react';
import { Pin } from '@/features/property-management/services/pins-service';
import { Button } from '@/features/shared/components/ui/button';
import { 
  XMarkIcon, 
  MapPinIcon, 
  EyeIcon, 
  TrashIcon,
  CalendarIcon,
  PhotoIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface PinsSidebarProps {
  pins: Pin[];
  isOpen: boolean;
  onClose: () => void;
  onPinClick: (pin: Pin) => void;
  onViewProperty: (pin: Pin) => void;
  onDeletePin: (pinId: string) => void;
  isLoading?: boolean;
}

export function PinsSidebar({ 
  pins, 
  isOpen, 
  onClose, 
  onPinClick, 
  onViewProperty, 
  onDeletePin,
  isLoading = false 
}: PinsSidebarProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold'>('all');
  const [selectedPins, setSelectedPins] = useState<string[]>([]);

  const getFilteredPins = useCallback(() => {
    return pins.filter(pin => {
      if (filterStatus === 'all') return true;
      return pin.status === filterStatus;
    });
  }, [pins, filterStatus]);

  const togglePinSelection = useCallback((pinId: string) => {
    setSelectedPins(prev => 
      prev.includes(pinId) 
        ? prev.filter(id => id !== pinId)
        : [...prev, pinId]
    );
  }, []);

  const selectAllPins = useCallback(() => {
    const filteredPins = getFilteredPins();
    setSelectedPins(filteredPins.map(pin => pin.id));
  }, [getFilteredPins]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedPins.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedPins.length} pins?`)) {
      try {
        for (const pinId of selectedPins) {
          await onDeletePin(pinId);
        }
        setSelectedPins([]);
      } catch (err) {
        console.error('Failed to delete pins:', err);
        alert('Failed to delete some pins');
      }
    }
  }, [selectedPins, onDeletePin]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredPins = getFilteredPins();

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">My Pins</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {filteredPins.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
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
        </div>

        {/* Bulk Actions */}
        {selectedPins.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedPins.length} selected
            </span>
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}

        {/* Select All */}
        {filteredPins.length > 0 && (
          <div className="mt-2">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={selectedPins.length === filteredPins.length && filteredPins.length > 0}
                onChange={selectAllPins}
                className="rounded border-gray-300"
              />
              <span>Select all</span>
            </label>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <MapPinIcon className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No pins found</h3>
            <p className="text-xs text-gray-500">
              {filterStatus === 'all' 
                ? "Start by creating your first pin."
                : `No ${filterStatus} pins found.`
              }
            </p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="p-4 space-y-3">
            {filteredPins.map((pin) => (
              <div 
                key={pin.id} 
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onPinClick(pin)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPins.includes(pin.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        togglePinSelection(pin.id);
                      }}
                      className="rounded border-gray-300"
                    />
                    <MapPinIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePin(pin.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
                
                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                  {pin.name || 'Untitled Property'}
                </h3>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatDate(pin.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                      pin.is_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pin.is_public ? 'Public' : 'Private'}
                    </span>
                    
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                      pin.status === 'sold'
                        ? 'bg-green-100 text-green-800' 
                        : pin.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pin.status || 'active'}
                    </span>
                  </div>
                  
                  {pin.notes && (
                    <p className="line-clamp-2 text-gray-600">{pin.notes}</p>
                  )}
                  
                  {pin.images && pin.images.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <PhotoIcon className="h-3 w-3" />
                      <span>{pin.images.length} image(s)</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProperty(pin);
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="p-4 grid grid-cols-2 gap-3">
            {filteredPins.map((pin) => (
              <div 
                key={pin.id} 
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onPinClick(pin)}
              >
                <div className="flex items-start justify-between mb-2">
                  <input
                    type="checkbox"
                    checked={selectedPins.includes(pin.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      togglePinSelection(pin.id);
                    }}
                    className="rounded border-gray-300"
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePin(pin.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-1 mb-2">
                  <MapPinIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium text-gray-900 text-xs line-clamp-1">
                    {pin.name || 'Untitled'}
                  </h3>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatDate(pin.created_at)}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-semibold rounded-full w-fit ${
                      pin.is_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pin.is_public ? 'Public' : 'Private'}
                    </span>
                    
                    <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-semibold rounded-full w-fit ${
                      pin.status === 'sold'
                        ? 'bg-green-100 text-green-800' 
                        : pin.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pin.status || 'active'}
                    </span>
                  </div>
                  
                  {pin.images && pin.images.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <PhotoIcon className="h-3 w-3" />
                      <span>{pin.images.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
