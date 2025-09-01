'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSearchHistory } from '@/features/property-management/hooks';
import { useAuth } from '@/features/authentication/components/AuthProvider';

// Extend Window interface to include map methods
declare global {
  interface Window {
    flyToLocation?: (lat: number, lng: number, zoom?: number) => void;
    dropPin?: (lat: number, lng: number, address?: string) => void;
    clearSearchResultPin?: () => void;
  }
}

interface MapboxMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  className?: string;
  onAddressSelect?: (address: string, lat: number, lng: number) => void;
  onPinCreate?: (lat: number, lng: number) => void;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function MapboxMap({ 
  lat = 37.7749, 
  lng = -122.4194, 
  zoom = 10, 
  pitch = 45,
  bearing = 0,
  className = "",
  onAddressSelect,
  onPinCreate,
  onMapReady
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Hooks for search history and authentication
  const { addSearch } = useSearchHistory();
  const { user } = useAuth();

  // Method to fly to a specific location
  const flyToLocation = (lat: number, lng: number, zoom: number = 15) => {
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 2000,
        essential: true
      });
    }
  };

  // Method to clear search result pin
  const clearSearchResultPin = () => {
    if (map.current && mapLoaded) {
      try {
        if (map.current.getLayer('search-result-pin-layer')) {
          map.current.removeLayer('search-result-pin-layer');
        }
        if (map.current.getLayer('search-result-pin-label')) {
          map.current.removeLayer('search-result-pin-label');
        }
        if (map.current.getSource('search-result-pin')) {
          map.current.removeSource('search-result-pin');
        }
      } catch (error) {
        console.error('Error clearing search result pin:', error);
      }
    }
  };

  // Method to drop a pin at specific coordinates
  const dropPin = (lat: number, lng: number, address?: string) => {
    if (map.current && mapLoaded) {
      // Clear any existing search result pin
      clearSearchResultPin();
      
      // Add new pin
      map.current.addSource('search-result-pin', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            address: address || 'Selected Location'
          }
        }
      });
      
      // Add pin layer
      map.current.addLayer({
        id: 'search-result-pin-layer',
        type: 'circle',
        source: 'search-result-pin',
        paint: {
          'circle-radius': 8,
          'circle-color': '#3B82F6',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }
      });
      
      // Add pin label
      map.current.addLayer({
        id: 'search-result-pin-label',
        type: 'symbol',
        source: 'search-result-pin',
        layout: {
          'text-field': ['get', 'address'],
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#1F2937',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1
        }
      });
    }
  };

  // Expose methods globally for other components to use
  useEffect(() => {
    if (map.current && mapLoaded) {
      // @ts-ignore - Adding methods to window for global access
      window.flyToLocation = flyToLocation;
      window.dropPin = dropPin;
      window.clearSearchResultPin = clearSearchResultPin;
      
      // Also call onMapReady callback if provided
      if (onMapReady) {
        onMapReady(map.current);
      }
    }
  }, [mapLoaded, onMapReady]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geocoder for address search
    if (onAddressSelect) {
      // Add click handler for address selection
      map.current.on('click', async (e) => {
        const { lng: clickLng, lat: clickLat } = e.lngLat;
        
        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${clickLng},${clickLat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              const address = data.features[0].place_name;
              
              // Record the map click address selection in search history
              try {
                await addSearch({
                  search_address: address,
                  normalized_address: address,
                  latitude: clickLat,
                  longitude: clickLng,
                  search_type: 'property_search',
                  search_filters: {
                    source: 'map_click',
                    reverse_geocoding: true,
                    coordinates_clicked: [clickLng, clickLat],
                    geocoding_success: true,
                    feature_id: data.features[0].id
                  },
                  user_agent: navigator.userAgent,
                });
              } catch (searchError) {
                console.error('Failed to record map click search history:', searchError);
              }
              
              onAddressSelect(address, clickLat, clickLng);
            }
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          
          // Record failed reverse geocoding attempt
          try {
            await addSearch({
              search_address: `${clickLat}, ${clickLng}`,
              latitude: clickLat,
              longitude: clickLng,
              search_type: 'property_search',
              search_filters: {
                source: 'map_click',
                reverse_geocoding: true,
                coordinates_clicked: [clickLng, clickLat],
                geocoding_success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              },
              user_agent: navigator.userAgent,
            });
          } catch (searchError) {
            console.error('Failed to record failed map click search history:', searchError);
          }
          
          // Fallback to coordinates
          onAddressSelect(`${clickLat}, ${clickLng}`, clickLat, clickLng);
        }
      });
    }

    // Add pin creation handler
    if (onPinCreate) {
      map.current.on('dblclick', async (e) => {
        const { lng: clickLng, lat: clickLat } = e.lngLat;
        
        // Record pin creation in search history
        try {
          await addSearch({
            search_address: `Pin at ${clickLat.toFixed(6)}, ${clickLng.toFixed(6)}`,
            latitude: clickLat,
            longitude: clickLng,
            search_type: 'pin_creation',
            search_filters: {
              source: 'map_double_click',
              coordinates_clicked: [clickLng, clickLat],
              action: 'create_pin'
            },
            user_agent: navigator.userAgent,
          });
        } catch (searchError) {
          console.error('Failed to record pin creation in search history:', searchError);
        }
        
        onPinCreate(clickLat, clickLng);
      });
    }

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Listen for address selection events from other components
    const handleAddressSelect = (event: CustomEvent) => {
      const { lat, lng, address } = event.detail;
      if (lat && lng) {
        flyToLocation(lat, lng, 15);
        
        // Automatically drop a pin at the selected location
        if (map.current && mapLoaded) {
          // Remove any existing search result pin
          const existingPin = map.current.getSource('search-result-pin');
          if (existingPin) {
            map.current.removeLayer('search-result-pin-layer');
            map.current.removeSource('search-result-pin');
          }
          
          // Add new pin
          map.current.addSource('search-result-pin', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              properties: {
                address: address || 'Selected Location'
              }
            }
          });
          
          // Add pin layer
          map.current.addLayer({
            id: 'search-result-pin-layer',
            type: 'circle',
            source: 'search-result-pin',
            paint: {
              'circle-radius': 8,
              'circle-color': '#3B82F6',
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 2
            }
          });
          
          // Add pin label
          map.current.addLayer({
            id: 'search-result-pin-label',
            type: 'symbol',
            source: 'search-result-pin',
            layout: {
              'text-field': ['get', 'address'],
              'text-font': ['Open Sans Regular'],
              'text-size': 12,
              'text-offset': [0, 1.5],
              'text-anchor': 'top'
            },
            paint: {
              'text-color': '#1F2937',
              'text-halo-color': '#FFFFFF',
              'text-halo-width': 1
            }
          });
        }
      }
    };

    window.addEventListener('addressSelect', handleAddressSelect as EventListener);

    return () => {
      if (map.current) {
        map.current.remove();
      }
      // Clean up event listener
      window.removeEventListener('addressSelect', handleAddressSelect as EventListener);
    };
  }, [lat, lng, zoom, onAddressSelect, onPinCreate]);

  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setCenter([lng, lat]);
    }
  }, [lat, lng, mapLoaded]);

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
