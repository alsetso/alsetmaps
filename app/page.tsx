"use client";

import { useState, useEffect } from 'react';
import { MapboxMap } from '@/features/property-search/components/MapboxMap';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { NewPropertySearch } from '@/features/property-search/components/NewPropertySearch';
import { validateClientEnvironmentVariables } from '@/lib/env-validation';

export default function HomePage() {
  const [envValid, setEnvValid] = useState<boolean | null>(null);

  // Validate environment variables on mount
  useEffect(() => {
    try {
      const isValid = validateClientEnvironmentVariables();
      setEnvValid(isValid);
    } catch (error) {
      console.error('Environment validation failed:', error);
      setEnvValid(false);
    }
  }, []);

  // Handle address selection from search
  const handleAddressSelect = (address: string, coordinates: [number, number]) => {
    console.log('🏠 [HomePage] Address selected:', { address, coordinates });
  };

  return (
    <SharedLayout>
      {/* Full-Screen Map Background */}
      <div className="absolute inset-0 z-0">
        <MapboxMap
          lat={37.7749}
          lng={-122.4194}
          zoom={10}
          pitch={60}
          bearing={15}
          className="w-full h-full"
          onPinCreate={(lat, lng) => {
            // Handle pin creation with coordinates
            console.log('Pin creation requested at:', lat, lng);
            // TODO: Implement pin creation logic here
            // This should create a default pin or prompt user for details
          }}
        />
      </div>
      
      {/* Address Search - Positioned 1.5rem from bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <NewPropertySearch onAddressSelect={handleAddressSelect} />
      </div>



      {/* Environment Validation Status */}
      {envValid === false && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
            ⚠️ Environment configuration issue detected
          </div>
        </div>
      )}
    </SharedLayout>
  );
}
