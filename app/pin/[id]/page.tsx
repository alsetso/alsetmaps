'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/authentication';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import { Input } from '@/features/shared/components/ui/input';
import { Textarea } from '@/features/shared/components/ui/textarea';
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  PhotoIcon,
  LinkIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { PinSharingModal } from '@/features/property-management/components/PinSharingModal';

interface PinData {
  pin: any;
  searchHistory: any;
  isOwner: boolean;
  isPublic: boolean;
  viewCount: number;
  lastViewed: string | null;
  shareUrl: string;
}

export default function PinIdPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pinData, setPinData] = useState<PinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    notes: '',
    is_public: false
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pinId = params.id as string;

  useEffect(() => {
    if (pinId && !authLoading) {
      loadPinData();
    }
  }, [pinId, user, authLoading]);

  const loadPinData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading pin data for:', pinId);

      const response = await fetch(`/api/pins/${pinId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pin not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to load pin data');
      }

      const data = await response.json();

      setPinData({
        pin: data.pin,
        searchHistory: data.searchHistory || null,
        isOwner: data.isOwner,
        isPublic: data.isPublic,
        viewCount: data.viewCount || 0,
        lastViewed: data.lastViewed,
        shareUrl: data.shareUrl || `${window.location.origin}/shared/property/${pinId}`
      });

      // Initialize edit form
      setEditForm({
        name: data.pin.name || '',
        notes: data.pin.notes || '',
        is_public: data.pin.is_public || false
      });

    } catch (error) {
      console.error('Error loading pin data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load pin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!pinData?.pin) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/pins/${pinId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update pin');
      }

      const updatedPin = await response.json();

      // Update local state
      setPinData(prev => prev ? {
        ...prev,
        pin: { ...prev.pin, ...updatedPin },
        isPublic: updatedPin.is_public
      } : null);

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating pin:', error);
      alert('Failed to update pin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (pinData?.pin) {
      setEditForm({
        name: pinData.pin.name || '',
        notes: pinData.pin.notes || '',
        is_public: pinData.pin.is_public || false
      });
    }
    setIsEditing(false);
  };

  const handleDeletePin = async () => {
    if (!pinData?.pin) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/pins/${pinId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to delete pin');
      }

      // Redirect to my pins page
      router.push('/my-pins');
    } catch (error) {
      console.error('Error deleting pin:', error);
      alert('Failed to delete pin');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleVisibility = useCallback(async () => {
    if (!pinData?.pin || !pinData.isOwner) return;
    
    setUpdatingVisibility(true);
    try {
      const newVisibility = !pinData.isPublic;
      const response = await fetch(`/api/pins/${pinId}/visibility`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: newVisibility })
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      // Update the local state
      setPinData(prev => prev ? {
        ...prev,
        isPublic: newVisibility,
        pin: { ...prev.pin, is_public: newVisibility }
      } : null);

      // Update edit form if editing
      if (isEditing) {
        setEditForm(prev => ({ ...prev, is_public: newVisibility }));
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
    } finally {
      setUpdatingVisibility(false);
    }
  }, [pinData?.pin, pinData?.isOwner, pinData?.isPublic, pinId, isEditing]);

  const copyShareUrlToClipboard = useCallback(async () => {
    if (!pinData?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(pinData.shareUrl);
      // You could add a toast notification here
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = pinData.shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [pinData?.shareUrl]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pin...</p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  if (error) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
            </div>
            <div className="space-x-4">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Button variant="outline" onClick={() => router.push('/my-pins')}>My Pins</Button>
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  if (!pinData?.pin) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pin Not Found</h1>
            <p className="text-gray-600 mb-6">The pin you're looking for doesn't exist or you don't have access to it.</p>
            <div className="space-x-4">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Button variant="outline" onClick={() => router.push('/my-pins')}>My Pins</Button>
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const { pin, searchHistory, isOwner, isPublic, viewCount, lastViewed, shareUrl } = pinData;

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit Pin' : (pin.name || 'Pin Details')}
                </h1>
              </div>
              
              {isOwner && !isEditing && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVisibility}
                    disabled={updatingVisibility}
                    className="flex items-center space-x-2"
                  >
                    {isPublic ? (
                      <>
                        <EyeIcon className="h-4 w-4" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <EyeSlashIcon className="h-4 w-4" />
                        <span>Private</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSharingModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <ShareIcon className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </div>
              )}

              {isOwner && isEditing && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex items-center space-x-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pin Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5" />
                    <span>Pin Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pin Name
                        </label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter pin name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <Textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Add notes about this pin"
                          rows={4}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_public"
                          checked={editForm.is_public}
                          onChange={(e) => setEditForm(prev => ({ ...prev, is_public: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                          Make this pin public
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Pin Name</label>
                        <p className="text-gray-900 text-lg font-medium">{pin.name || 'Untitled Pin'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-gray-900">{pin.input_address || 'Address not available'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Latitude</label>
                          <p className="text-gray-900 font-mono">{pin.latitude}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Longitude</label>
                          <p className="text-gray-900 font-mono">{pin.longitude}</p>
                        </div>
                      </div>

                      {pin.notes && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Notes</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{pin.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Created {formatDate(pin.created_at)}</span>
                        </div>
                        {pin.updated_at !== pin.created_at && (
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Updated {formatDate(pin.updated_at)}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Search History */}
              {searchHistory && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Search History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Search Address</label>
                        <p className="text-gray-900">{searchHistory.search_address}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Search Type</label>
                        <p className="text-gray-900 capitalize">{searchHistory.search_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Credits Used</label>
                        <p className="text-gray-900">{searchHistory.credits_used || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Search Date</label>
                        <p className="text-gray-900">{formatDate(searchHistory.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              {pin.images && pin.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PhotoIcon className="h-5 w-5" />
                      <span>Images ({pin.images.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {pin.images.map((image: string, index: number) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Pin image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Pin Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Visibility</span>
                      <Badge variant={isPublic ? "default" : "secondary"} className="flex items-center space-x-1">
                        {isPublic ? (
                          <>
                            <GlobeAltIcon className="h-3 w-3" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <LockClosedIcon className="h-3 w-3" />
                            <span>Private</span>
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant="default">
                        {pin.status || 'active'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pin ID</span>
                      <span className="text-xs font-mono text-gray-500">{pin.id.slice(0, 8)}...</span>
                    </div>

                    {viewCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Views</span>
                        <span className="text-sm font-medium">{viewCount}</span>
                      </div>
                    )}

                    {lastViewed && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Viewed</span>
                        <span className="text-sm font-medium">
                          {formatDate(lastViewed)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {isOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setShowSharingModal(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <ShareIcon className="h-4 w-4 mr-2" />
                      Share Pin
                    </Button>
                    
                    <Button
                      onClick={copyShareUrlToClipboard}
                      className="w-full"
                      variant="outline"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Copy Share URL
                    </Button>

                    <Button
                      onClick={() => window.location.href = `/property/${pin.id}`}
                      className="w-full"
                      variant="outline"
                    >
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>

                    <div className="border-t pt-3">
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Pin
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <InformationCircleIcon className="h-5 w-5" />
                    <span>Quick Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Pin created from {searchHistory?.search_type || 'unknown'} search</p>
                    <p>• Located at coordinates {pin.latitude}, {pin.longitude}</p>
                    <p>• {isPublic ? 'Publicly visible' : 'Private to you'}</p>
                    {pin.notes && <p>• Has personal notes</p>}
                    {pin.images && pin.images.length > 0 && <p>• Contains {pin.images.length} image(s)</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sharing Modal */}
        {showSharingModal && (
          <PinSharingModal
            pin={pin}
            isOpen={showSharingModal}
            onClose={() => setShowSharingModal(false)}
            shareUrl={shareUrl}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Pin</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{pin.name || 'this pin'}"? This will permanently remove the pin and all its data.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeletePin}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleting ? 'Deleting...' : 'Delete Pin'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
}

