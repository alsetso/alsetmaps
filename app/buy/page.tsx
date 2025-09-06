"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { ForSalePinPopup } from '@/features/shared/components/ForSalePinPopup';
import { PublicPinsService, PublicPin } from '@/features/property-management/services/public-pins-service';

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

export default function BuyPage() {
  const mapCenter = useMemo(() => ({ lat: 39.8283, lng: -98.5795 }), []); // Center of continental United States
  const [forSalePins, setForSalePins] = useState<PublicPin[]>([]);
  const [isLoadingForSalePins, setIsLoadingForSalePins] = useState(false);
  
  // For-Sale Pin Popup state
  const [selectedForSalePin, setSelectedForSalePin] = useState<PublicPin | null>(null);
  const [showForSalePinPopup, setShowForSalePinPopup] = useState(false);

  const fetchForSalePins = useCallback(async () => {
    setIsLoadingForSalePins(true);
    try {
      const result = await PublicPinsService.getPublicPins();
      if (result.success && result.pins) {
        setForSalePins(result.pins);
        console.log(`✅ Fetched ${result.pins.length} for-sale pins`);
      } else {
        console.log('No for-sale pins found or error fetching pins:', result.error);
        setForSalePins([]);
      }
    } catch (error) {
      console.error('Error fetching for-sale pins:', error);
      setForSalePins([]);
    } finally {
      setIsLoadingForSalePins(false);
    }
  }, []);

  const handleForSalePinClick = useCallback((pin: PublicPin) => {
    console.log('For-sale pin clicked:', pin);
    setSelectedForSalePin(pin);
    setShowForSalePinPopup(true);
  }, []);

  const handleMapClick = useCallback(() => {
    // Map clicked - no action needed
  }, []);

  // Handle for-sale pin popup close
  const handleCloseForSalePinPopup = useCallback(() => {
    setShowForSalePinPopup(false);
    setSelectedForSalePin(null);
  }, []);

  // Handle view property for for-sale pin
  const handleViewForSaleProperty = useCallback((pin: PublicPin) => {
    console.log('View property for for-sale pin:', pin);
    // Navigate to the shared property page
    window.location.href = `/shared/property/${pin.id}`;
  }, []);

  // Fetch for-sale pins on component mount
  useEffect(() => {
    fetchForSalePins();
  }, [fetchForSalePins]);

  // Prevent body scroll for full height layout
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <SharedLayout showTopbar={true} fullHeight={true}>
      {/* Full viewport height container with topbar overlay */}
      <div className="relative w-full h-screen">
        <MapboxMap
          lat={mapCenter.lat}
          lng={mapCenter.lng}
          zoom={4}
          className="w-full h-screen"
          pins={[]} // No user pins on buy page
          publicPins={forSalePins}
          onAddressSelect={(address, coordinates) => {
            console.log('Address selected:', address, coordinates);
          }}
          onPinCreate={() => {
            // No pin creation on buy page
          }}
          onPinClick={() => {
            // No user pin clicks on buy page
          }}
          onPublicPinClick={handleForSalePinClick}
          onMapClick={handleMapClick}
          onViewProperty={() => {
            // No user property viewing on buy page
          }}
          onTempPinCreate={undefined} // No temp pin creation on buy page
        />
        
        {/* For-Sale Pins Loading Indicator */}
        {isLoadingForSalePins && (
          <div className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              Loading for-sale properties...
            </div>
          </div>
        )}

        {/* For-Sale Properties Count */}
        {!isLoadingForSalePins && forSalePins.length > 0 && (
          <div className="absolute top-20 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">{forSalePins.length}</span>
              <span>properties for sale</span>
            </div>
          </div>
        )}
      </div>

      {/* For-Sale Pin Popup */}
      <ForSalePinPopup
        pin={selectedForSalePin}
        isOpen={showForSalePinPopup}
        onClose={handleCloseForSalePinPopup}
        onViewProperty={handleViewForSaleProperty}
      />
    </SharedLayout>
  );
}

