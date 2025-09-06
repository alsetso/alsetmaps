'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Button } from '@/features/shared/components/ui/button';
import { PinsService, Pin } from '@/features/property-management/services/pins-service';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { AccountSetupService } from '@/features/authentication/services/account-setup-service';
import { OnboardingModal } from '@/features/authentication/components/OnboardingModal';
import { CreatePinModal } from '@/features/shared/components/CreatePinModal';
import { PinPopup } from '@/features/shared/components/PinPopup';
import { PinsSidebar } from '@/features/shared/components/PinsSidebar';
import { 
  CogIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

import dynamic from 'next/dynamic';

// Dynamically import MapboxMap to avoid SSR issues
const MapboxMap = dynamic(() => import('@/features/property-search/components/MapboxMap').then(mod => ({ default: mod.MapboxMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const mapCenter = useMemo(() => ({ lat: 39.8283, lng: -98.5795 }), []); // Center of continental United States
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  
  // Pins state
  const [pins, setPins] = useState<Pin[]>([]);
  const [isLoadingPins, setIsLoadingPins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  
  // Sidebar state
  const [showPinsSidebar, setShowPinsSidebar] = useState(false);
  
  // Create Pin Modal state
  const [showCreatePinModal, setShowCreatePinModal] = useState(false);
  const [tempPinLocation, setTempPinLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  // Pin Popup state
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [showPinPopup, setShowPinPopup] = useState(false);

  // Check onboarding status
  useEffect(() => {
    if (!authLoading && user) {
      checkOnboardingStatus();
    }
  }, [user, authLoading]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    const status = await AccountSetupService.checkAccountStatus();
    if (status.hasAccount && status.hasCredits) {
      setIsOnboardingComplete(true);
    } else {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsOnboardingComplete(true);
  };

  // Fetch user pins
  const fetchUserPins = useCallback(async () => {
    if (!isOnboardingComplete) return;
    
    setIsLoadingPins(true);
    try {
      const result = await PinsService.getUserPins();
      if (result.success && result.pins) {
        setPins(result.pins);
        console.log(`✅ Fetched ${result.pins.length} user pins`);
      } else {
        console.log('No pins found or error fetching pins:', result.error);
        setPins([]);
      }
    } catch (error) {
      console.error('Error fetching user pins:', error);
      setPins([]);
    } finally {
      setIsLoadingPins(false);
    }
  }, [isOnboardingComplete]);

  // Load credits
  const loadCredits = useCallback(async () => {
    if (!user) return;
    
    try {
      const creditBalance = await AccountSetupService.getCreditBalance();
      if (creditBalance) {
        setCredits(creditBalance.availableCredits);
      }
    } catch (err) {
      console.error('Error loading credits:', err);
    }
  }, [user]);

  // Fetch pins when onboarding is complete
  useEffect(() => {
    if (isOnboardingComplete) {
      fetchUserPins();
      loadCredits();
    }
  }, [isOnboardingComplete, fetchUserPins, loadCredits]);

  // Map event handlers
  const handlePinClick = useCallback((pin: Pin) => {
    console.log('Pin clicked:', pin);
    setSelectedPin(pin);
    setShowPinPopup(true);
  }, []);

  const handleMapClick = useCallback(() => {
    // Map clicked - no action needed
  }, []);

  const handleViewProperty = useCallback((pin: Pin) => {
    console.log('View property for pin:', pin);
    window.location.href = `/property/${pin.id}`;
  }, []);

  // Handle temporary pin creation from map click
  const handleTempPinCreate = useCallback((lat: number, lng: number, address: string) => {
    setTempPinLocation({ latitude: lat, longitude: lng, address });
    setShowCreatePinModal(true);
  }, []);

  // Handle pin creation success
  const handlePinCreated = useCallback(() => {
    fetchUserPins();
  }, [fetchUserPins]);

  // Handle modal close
  const handleCloseCreatePinModal = useCallback(() => {
    setShowCreatePinModal(false);
    setTempPinLocation(null);
  }, []);

  // Handle pin popup close
  const handleClosePinPopup = useCallback(() => {
    setShowPinPopup(false);
    setSelectedPin(null);
  }, []);

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

  // Prevent body scroll for full height layout
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);


  if (authLoading) {
    return (
      <SharedLayout>
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
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
    <SharedLayout showTopbar={true} fullHeight={true}>
      {/* Full viewport height container with topbar overlay */}
      <div className="relative w-full h-screen">
        <MapboxMap
          lat={mapCenter.lat}
          lng={mapCenter.lng}
          zoom={4}
          className="w-full h-screen"
          pins={user ? pins : []}
          onAddressSelect={(address, coordinates) => {
            console.log('Address selected:', address, coordinates);
          }}
          onPinCreate={(pinData) => {
            console.log('Pin created:', pinData);
            if (user) {
              fetchUserPins();
            }
          }}
          onPinClick={handlePinClick}
          onMapClick={handleMapClick}
          onViewProperty={handleViewProperty}
          onTempPinCreate={user ? handleTempPinCreate : undefined}
        />
        
        {/* Pins Loading Indicator - positioned below topbar */}
        {user && isLoadingPins && (
          <div className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading pins...
            </div>
          </div>
        )}

        {/* Dashboard Controls - positioned in top-left */}
        <div className="absolute top-20 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowPinsSidebar(!showPinsSidebar)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Bars3Icon className="h-4 w-4" />
              <span>Pins ({pins.length})</span>
            </Button>
            
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <CogIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{credits || 0}</div>
              <div className="text-gray-500">Credits</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{pins.filter(p => p.status === 'active').length}</div>
              <div className="text-gray-500">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pins Sidebar */}
      <PinsSidebar
        pins={pins}
        isOpen={showPinsSidebar}
        onClose={() => setShowPinsSidebar(false)}
        onPinClick={handlePinClick}
        onViewProperty={handleViewProperty}
        onDeletePin={handleDeletePin}
        isLoading={isLoadingPins}
      />

      {/* Only show modals and popups for authenticated users */}
      {user && (
        <>
          <OnboardingModal 
            isOpen={showOnboarding} 
            onComplete={handleOnboardingComplete} 
          />

          {/* Create Pin Modal */}
          {tempPinLocation && (
            <CreatePinModal
              isOpen={showCreatePinModal}
              onClose={handleCloseCreatePinModal}
              onPinCreated={handlePinCreated}
              latitude={tempPinLocation.latitude}
              longitude={tempPinLocation.longitude}
              address={tempPinLocation.address}
            />
          )}

          {/* Pin Popup */}
          <PinPopup
            pin={selectedPin}
            isOpen={showPinPopup}
            onClose={handleClosePinPopup}
            onViewProperty={handleViewProperty}
          />
        </>
      )}
    </SharedLayout>
  );
}

