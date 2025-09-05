"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { OnboardingModal } from '@/features/authentication/components/OnboardingModal';
import { CreatePinModal } from '@/features/shared/components/CreatePinModal';
import { PinPopup } from '@/features/shared/components/PinPopup';
import { AccountSetupService } from '@/features/authentication/services/account-setup-service';
import { PinsService, Pin } from '@/features/property-management/services/pins-service';
import { useAuth } from '@/features/authentication/components/AuthProvider';

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

export default function HomePage() {
  const { user, loading } = useAuth();
  const mapCenter = useMemo(() => ({ lat: 39.8283, lng: -98.5795 }), []); // Center of continental United States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userPins, setUserPins] = useState<Pin[]>([]);
  const [isLoadingPins, setIsLoadingPins] = useState(false);
  
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

  useEffect(() => {
    // Only check onboarding status if user is authenticated
    if (!loading && user) {
      checkOnboardingStatus();
    }
  }, [user, loading]);

  const checkOnboardingStatus = async () => {
    // Double-check that user is authenticated before proceeding
    if (!user) {
      return;
    }
    
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

  const fetchUserPins = useCallback(async () => {
    if (!isOnboardingComplete) return;
    
    setIsLoadingPins(true);
    try {
      const result = await PinsService.getUserPins();
      if (result.success && result.pins) {
        setUserPins(result.pins);
        console.log(`✅ Fetched ${result.pins.length} user pins`);
      } else {
        console.log('No pins found or error fetching pins:', result.error);
        setUserPins([]);
      }
    } catch (error) {
      console.error('Error fetching user pins:', error);
      setUserPins([]);
    } finally {
      setIsLoadingPins(false);
    }
  }, [isOnboardingComplete]);

  const handlePinClick = useCallback((pin: Pin) => {
    console.log('Pin clicked:', pin);
    setSelectedPin(pin);
    setShowPinPopup(true);
  }, []);

  const handleMapClick = useCallback(() => {
    // Map clicked - no action needed with enhanced topbar search
  }, []);

  const handleViewProperty = useCallback((pin: Pin) => {
    console.log('View property for pin:', pin);
    // Navigate to the property page
    window.location.href = `/property/${pin.id}`;
  }, []);

  // Handle temporary pin creation from map click
  const handleTempPinCreate = useCallback((lat: number, lng: number, address: string) => {
    setTempPinLocation({ latitude: lat, longitude: lng, address });
    setShowCreatePinModal(true);
  }, []);

  // Handle pin creation success
  const handlePinCreated = useCallback(() => {
    // Refresh the pins list
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

  // Fetch pins when onboarding is complete
  useEffect(() => {
    if (isOnboardingComplete) {
      fetchUserPins();
    }
  }, [isOnboardingComplete, fetchUserPins]);

  // Prevent body scroll for full height layout
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (loading) {
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
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Alset Maps</h1>
            <p className="text-gray-600 mb-6">Please sign in to access the property search and mapping features.</p>
            <a 
              href="/login" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
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
          pins={userPins}
          onAddressSelect={(address, coordinates) => {
            console.log('Address selected:', address, coordinates);
          }}
          onPinCreate={(pinData) => {
            console.log('Pin created:', pinData);
            fetchUserPins();
          }}
          onPinClick={handlePinClick}
          onMapClick={handleMapClick}
          onViewProperty={handleViewProperty}
          onTempPinCreate={handleTempPinCreate}
        />
        
        {/* Pins Loading Indicator - positioned below topbar */}
        {isLoadingPins && (
          <div className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading pins...
            </div>
          </div>
        )}
      </div>

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

    </SharedLayout>
  );
}