"use client";

import { useState, useEffect } from 'react';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { SmartSearch } from '@/features/property-search/components/SmartSearch';
import { OnboardingModal } from '@/features/authentication/components/OnboardingModal';
import { AccountSetupService } from '@/features/authentication/services/account-setup-service';
import { PinsService } from '@/features/property-management/services/pins-service';
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
  const [mapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of continental United States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userPins, setUserPins] = useState<any[]>([]);
  const [isLoadingPins, setIsLoadingPins] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState(true);

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

  const fetchUserPins = async () => {
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
  };

  const handlePinClick = (pin: any) => {
    console.log('Pin clicked:', pin);
    // Hide the smart search component when a pin is clicked
    setShowSmartSearch(false);
  };

  const handleMapClick = () => {
    // Show the smart search component when clicking on the map (not on a pin)
    setShowSmartSearch(true);
  };

  const handleCreateListing = (pin: any) => {
    console.log('Create listing for pin:', pin);
    // TODO: Implement create listing logic here
    // This could navigate to a listing creation page or open a modal
  };

  const handleSmartSearchUpgrade = async (searchHistoryId: string) => {
    console.log('Smart search upgrade for search history:', searchHistoryId);
    // TODO: Implement smart search upgrade logic here
    // This should:
    // 1. Check user has enough credits
    // 2. Call the rapid API for smart search data
    // 3. Update the search_history record with smart_data
    // 4. Refresh the pins to show updated data
    // 5. Deduct credits
  };

  const handleShowSmartSearch = () => {
    // Show the smart search component when callout is closed
    setShowSmartSearch(true);
  };

  // Fetch pins when onboarding is complete
  useEffect(() => {
    if (isOnboardingComplete) {
      fetchUserPins();
    }
  }, [isOnboardingComplete]);



  return (
    <SharedLayout>
      {/* Full-Screen Map Background */}
      <div className="absolute inset-0 z-0 h-screen">
        <MapboxMap
          lat={mapCenter.lat}
          lng={mapCenter.lng}
          zoom={4}
          pitch={45}
          bearing={0}
          className="w-full h-full"
          pins={userPins}
          onPinCreate={(lat: number, lng: number) => {
            console.log('Pin creation requested at:', lat, lng);
            // TODO: Implement pin creation logic here
          }}
          onPinClick={handlePinClick}
          onMapClick={handleMapClick}
          onCreateListing={handleCreateListing}
          onSmartSearchUpgrade={handleSmartSearchUpgrade}
          onShowSmartSearch={handleShowSmartSearch}
        />
        
        {/* Pins Loading Indicator */}
        {isLoadingPins && (
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading pins...
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Modal - Overlays the map until user completes setup */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />

      {/* Smart Search Component - Only shows after onboarding is complete and when not hidden */}
      {isOnboardingComplete && showSmartSearch && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
          <SmartSearch onPinCreated={fetchUserPins} />
        </div>
      )}
    </SharedLayout>
  );
}
