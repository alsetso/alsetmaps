'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '@/features/authentication/components/AuthProvider';

// Extend Window interface to include map methods
declare global {
  interface Window {
    flyToLocation?: (lat: number, lng: number, zoom?: number) => void;
    dropPin?: (lat: number, lng: number, address?: string) => void;
    clearSearchResultPin?: () => void;
    handleCreateListing?: (pinId: string) => void;
    handleSmartSearchUpgrade?: (searchHistoryId: string) => void;
    showSmartSearch?: () => void;
  }
}

interface Pin {
  id: string;
  user_id: string;
  search_history_id?: string;
  latitude: number;
  longitude: number;
  name: string;
  images?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
  search_history?: {
    id: string;
    search_address: string;
    search_type: 'basic' | 'smart';
    search_tier: 'basic' | 'smart';
    credits_consumed: number;
    smart_data?: any;
    created_at: string;
  };
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
  onPinClick?: (pin: Pin) => void;
  onMapClick?: () => void;
  onCreateListing?: (pin: Pin) => void;
  onSmartSearchUpgrade?: (searchHistoryId: string) => void;
  onShowSmartSearch?: () => void;
  onMapReady?: (map: mapboxgl.Map) => void;
  pins?: Pin[];
}

export function MapboxMap({ 
  lat = 39.8283, 
  lng = -98.5795, 
  zoom = 4, 
  pitch = 45,
  bearing = 0,
  className = "",
  onAddressSelect,
  onPinCreate,
  onPinClick,
  onMapClick,
  onCreateListing,
  onSmartSearchUpgrade,
  onShowSmartSearch,
  onMapReady,
  pins = []
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  
  // Hooks for authentication
  const { user: _user } = useAuth();

  // Method to fly to a specific location with smooth animation
  const flyToLocation = useCallback((lat: number, lng: number, zoom: number = 15) => {
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 2500,
        essential: true,
        curve: 1.42, // Smooth curve animation
        speed: 1.2, // Slightly faster for better UX
        easing: (t: number) => t * (2 - t) // Smooth easing function
      });
    }
  }, [mapLoaded]);



  // Method to clear search result pin
  const clearSearchResultPin = useCallback(() => {
    if (map.current && mapLoaded) {
      try {
        // Remove all pin-related layers
        const layersToRemove = [
          'search-result-pin-layer',
          'search-result-pin-label',
          'search-result-pin-pulse',
          'search-result-pin-glow'
        ];
        
        layersToRemove.forEach(layerId => {
          if (map.current?.getLayer(layerId)) {
            map.current.removeLayer(layerId);
          }
        });
        
        // Remove all pin-related sources
        const sourcesToRemove = [
          'search-result-pin',
          'search-result-pin-pulse'
        ];
        
        sourcesToRemove.forEach(sourceId => {
          if (map.current?.getSource(sourceId)) {
            map.current.removeSource(sourceId);
          }
        });
      } catch (error) {
        console.error('Error clearing search result pin:', error);
      }
    }
  }, [mapLoaded]);

  // Method to handle create listing button click
  const handleCreateListing = useCallback((pinId: string) => {
    if (onCreateListing) {
      // Find the full pin data from the pins array
      const fullPin = pins.find(p => p.id === pinId);
      if (fullPin) {
        onCreateListing(fullPin);
      }
    }
  }, [onCreateListing, pins]);

  // Method to handle smart search upgrade
  const handleSmartSearchUpgrade = useCallback((searchHistoryId: string) => {
    if (onSmartSearchUpgrade) {
      onSmartSearchUpgrade(searchHistoryId);
    }
  }, [onSmartSearchUpgrade]);

  // Method to show smart search
  const showSmartSearch = useCallback(() => {
    if (onShowSmartSearch) {
      onShowSmartSearch();
    }
  }, [onShowSmartSearch]);

  // Method to render existing user pins
  const renderExistingPins = (onPinClick?: (pin: Pin) => void) => {
    if (!map.current || !mapLoaded || pins.length === 0) return;

    // Check if map style is fully loaded
    if (!map.current.isStyleLoaded()) {
      console.log('⏳ Map style not yet loaded, waiting...');
      // Wait for style to load, then retry
      setTimeout(() => {
        if (map.current && map.current.isStyleLoaded()) {
          renderExistingPins(onPinClick);
        }
      }, 100);
      return;
    }

    try {
      // Clear any existing user pins first
      clearExistingPins();

      // Create a GeoJSON source for all pins
      const pinFeatures = pins.map(pin => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [pin.longitude, pin.latitude]
        },
        properties: {
          id: pin.id,
          name: pin.name,
          notes: pin.notes || '',
          hasImages: pin.images && pin.images.length > 0
        }
      }));

      // Add pins source
      map.current.addSource('user-pins', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pinFeatures
        }
      });

      // Add pin markers layer
      map.current.addLayer({
        id: 'user-pins-markers',
        type: 'circle',
        source: 'user-pins',
        paint: {
          'circle-radius': 8,
          'circle-color': '#10B981', // Green color for user pins
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.8
        }
      });

      // Add pin labels
      map.current.addLayer({
        id: 'user-pins-labels',
        type: 'symbol',
        source: 'user-pins',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-max-width': 12,
          'text-line-height': 1.2
        },
        paint: {
          'text-color': '#1F2937',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1,
          'text-halo-blur': 0.5
        }
      });

      // Add click handler for user pins
      map.current.on('click', 'user-pins-markers', (e) => {
        if (e.features && e.features[0]) {
          const pin = e.features[0];
          const geometry = pin.geometry as any;
          const coordinates = geometry.coordinates.slice();
          const name = pin.properties?.name || 'Pin';
          
          // Ensure the popup appears above the pin
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // Fly to the pin location with smooth animation
          flyToLocation(coordinates[1], coordinates[0], 16);

          // Find the full pin data to get search history
          const fullPin = pins.find(p => p.id === pin.properties?.id);
          const searchHistory = fullPin?.search_history;
          const isBasicSearch = searchHistory?.search_tier === 'basic';
          const hasSmartData = searchHistory?.smart_data;

          // Create enhanced popup content
          const popupContent = `
            <style>
              .mapboxgl-popup-content {
                padding: 0 !important;
                margin: 0 !important;
              }
            </style>
            <div class="w-80 bg-white overflow-hidden p-0">
              <!-- Header -->
              <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 class="font-semibold text-gray-900 truncate">${name}</h3>
                <button onclick="this.closest('.mapboxgl-popup').remove(); if (window.showSmartSearch) window.showSmartSearch();" class="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <!-- Details Section -->
              <div class="p-4">
                <!-- Search History Info -->
                ${searchHistory ? `
                  <div class="mb-4 p-3 bg-gray-50 rounded-md">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-700">Search Info</span>
                      <span class="text-xs px-2 py-1 rounded-full ${isBasicSearch ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                        ${isBasicSearch ? 'Basic' : 'Smart'}
                      </span>
                    </div>
                    <p class="text-xs text-gray-600 mb-1">${searchHistory.search_address}</p>
                    <p class="text-xs text-gray-500">${new Date(searchHistory.created_at).toLocaleDateString()}</p>
                  </div>
                ` : ''}

                <!-- Smart Search Upgrade (only for basic searches) -->
                ${isBasicSearch && !hasSmartData ? `
                  <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-blue-900">Upgrade to Smart Search</span>
                      <span class="text-xs text-blue-600">1 credit</span>
                    </div>
                    <p class="text-xs text-blue-700 mb-3">Get detailed property data, market analysis, and more insights.</p>
                    <button onclick="handleSmartSearchUpgrade('${searchHistory?.id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm">
                      Upgrade to Smart Search
                    </button>
                  </div>
                ` : ''}

                <!-- Smart Data Display (if available) -->
                ${hasSmartData ? `
                  <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div class="flex items-center mb-2">
                      <svg class="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-sm font-medium text-green-900">Smart Data Available</span>
                    </div>
                    <p class="text-xs text-green-700">Property details, market analysis, and insights loaded.</p>
                  </div>
                ` : ''}
                
                <!-- Type Selector -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>
                
                <!-- Notes Section -->
                ${pin.properties?.notes ? `
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">${pin.properties.notes}</p>
                  </div>
                ` : ''}
                
                <!-- Images Indicator -->
                ${pin.properties?.hasImages ? `
                  <div class="mb-4">
                    <div class="flex items-center text-sm text-blue-600">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Has images
                    </div>
                  </div>
                ` : ''}
                
                <!-- Action Button -->
                <button onclick="handleCreateListing('${pin.properties?.id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm">
                  Create Listing
                </button>
              </div>
            </div>
          `;

          // Create and show popup (keep it open)
          new mapboxgl.Popup({ 
            closeOnClick: false,
            closeButton: false, // Remove the default Mapbox close button
            offset: [0, -10], // Offset to position above the pin
            maxWidth: 'none', // Allow full width
            className: 'custom-popup' // Add custom class for styling
          })
            .setLngLat(coordinates as [number, number])
            .setHTML(popupContent)
            .addTo(map.current!);

          // Call the onPinClick callback if provided
          if (onPinClick) {
            // Find the full pin data from the pins array
            const fullPin = pins.find(p => p.id === pin.properties?.id);
            if (fullPin) {
              onPinClick(fullPin);
            }
          }
        }
      });

      // Change cursor to pointer when hovering over pins
      map.current.on('mouseenter', 'user-pins-markers', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'user-pins-markers', () => {
        map.current!.getCanvas().style.cursor = '';
      });

      console.log(`✅ Rendered ${pins.length} user pins on the map`);
    } catch (error) {
      console.error('Error rendering existing pins:', error);
    }
  };

  // Method to clear existing user pins
  const clearExistingPins = useCallback(() => {
    if (!map.current) return;

    try {
      // Remove user pin layers
      const userPinLayers = ['user-pins-markers', 'user-pins-labels'];
      userPinLayers.forEach(layerId => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });

      // Remove user pins source
      if (map.current.getSource('user-pins')) {
        map.current.removeSource('user-pins');
      }
    } catch (error) {
      console.error('Error clearing existing pins:', error);
    }
  }, []);

  // Method to drop a pin at specific coordinates with enhanced styling
  const dropPin = useCallback((lat: number, lng: number, address?: string) => {
    if (map.current && mapLoaded) {
      // Always clear any existing search result pins first
      clearSearchResultPin();
      
      // Add main pin source
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

      // Add pulse effect source for better visibility
      map.current.addSource('search-result-pin-pulse', {
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
      
      // Add main pin layer with enhanced styling
      map.current.addLayer({
        id: 'search-result-pin-layer',
        type: 'circle',
        source: 'search-result-pin',
        paint: {
          'circle-radius': 10,
          'circle-color': '#3B82F6',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 3,
          'circle-stroke-opacity': 0.8
        }
      });

      // Add pulse effect layer
      map.current.addLayer({
        id: 'search-result-pin-pulse',
        type: 'circle',
        source: 'search-result-pin-pulse',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 15,
            15, 25
          ],
          'circle-color': '#3B82F6',
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.3,
            15, 0.1
          ],
          'circle-stroke-color': '#3B82F6',
          'circle-stroke-width': 2,
          'circle-stroke-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.5,
            15, 0.2
          ]
        }
      });
      
      // Add pin label with better positioning
      map.current.addLayer({
        id: 'search-result-pin-label',
        type: 'symbol',
        source: 'search-result-pin',
        layout: {
          'text-field': ['get', 'address'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 14,
          'text-offset': [0, 1.8],
          'text-anchor': 'top',
          'text-max-width': 15,
          'text-line-height': 1.2
        },
        paint: {
          'text-color': '#1F2937',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 2,
          'text-halo-blur': 1
        }
      });

      // Add a subtle glow effect around the pin
      map.current.addLayer({
        id: 'search-result-pin-glow',
        type: 'circle',
        source: 'search-result-pin',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 20,
            15, 35
          ],
          'circle-color': '#3B82F6',
          'circle-opacity': 0.1,
          'circle-stroke-color': '#3B82F6',
          'circle-stroke-width': 1,
          'circle-stroke-opacity': 0.3
        }
      });
    }
  }, [mapLoaded, clearSearchResultPin]);



  // Expose methods globally for other components to use
  useEffect(() => {
    if (map.current && mapLoaded) {
      // @ts-ignore - Adding methods to window for global access
      window.flyToLocation = flyToLocation;
      window.dropPin = dropPin;
      window.clearSearchResultPin = clearSearchResultPin;
      window.handleCreateListing = handleCreateListing;
      window.handleSmartSearchUpgrade = handleSmartSearchUpgrade;
      window.showSmartSearch = showSmartSearch;
      
      // Also call onMapReady callback if provided
      if (onMapReady) {
        onMapReady(map.current);
      }
    }
  }, [mapLoaded, onMapReady, handleCreateListing, handleSmartSearchUpgrade, showSmartSearch]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with enhanced settings
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      maxZoom: 20,
      minZoom: 3,
      maxPitch: 85,
      antialias: true,
      fadeDuration: 300
    });

    // Navigation controls removed as requested

    // Add click handler for map clicks (not on pins)
    map.current.on('click', async (e) => {
      // Check if the click was on a pin - if so, don't handle it here
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['user-pins-markers']
      });
      
      if (features.length > 0) {
        // Click was on a pin, let the pin click handler deal with it
        return;
      }

      // Call the onMapClick callback if provided
      if (onMapClick) {
        onMapClick();
      }

      // Add geocoder for address search if onAddressSelect is provided
      if (onAddressSelect) {
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
              console.log('Map click search recorded (history service not yet implemented)');
              
              onAddressSelect(address, clickLat, clickLng);
            }
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          
          // Record failed reverse geocoding attempt
          console.log('Failed map click search recorded (history service not yet implemented)');
          
          // Fallback to coordinates
          onAddressSelect(`${clickLat}, ${clickLng}`, clickLat, clickLng);
        }
      }
    });

    // Add pin creation handler
    if (onPinCreate) {
      map.current.on('dblclick', async (e) => {
        const { lng: clickLng, lat: clickLat } = e.lngLat;
        
        // Record pin creation in search history
        console.log('Pin creation recorded (history service not yet implemented)');
        
        onPinCreate(clickLat, clickLng);
      });
    }

    // Enhanced map load handler
    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add custom map styling after load
      if (map.current) {
        // Add a subtle shadow effect to the map
        const mapStyle = map.current.getStyle();
        if (mapStyle) {
          // Custom styling can be added here
          console.log('Map loaded with enhanced styling');
        }
      }
      
      // If we have pins and the map is loaded, render them
      if (pins.length > 0) {
        console.log('🗺️ Map loaded, rendering existing pins...');
        setTimeout(() => {
          renderExistingPins(onPinClick);
        }, 100);
      }
    });

    // Listen for address selection events from other components
    const handleAddressSelect = (event: CustomEvent) => {
      const { lat, lng, address } = event.detail;
      if (lat && lng) {
        // Fly to the selected location with smooth animation
        flyToLocation(lat, lng, 15);
        
        // Automatically drop a pin at the selected location
        if (map.current && mapLoaded) {
          // Remove any existing search result pin
          const existingPin = map.current.getSource('search-result-pin');
          if (existingPin) {
            clearSearchResultPin();
          }
          
          // Add new pin with enhanced styling
          dropPin(lat, lng, address);
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
  }, [lat, lng, zoom, onAddressSelect, onPinCreate, onMapClick]);

  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setCenter([lng, lat]);
    }
  }, [lat, lng, mapLoaded]);

  // Memoize pins to prevent unnecessary re-renders
  const memoizedPins = useMemo(() => pins, [pins.length, pins.map(p => p.id).join(',')]);

  // Render existing pins when pins array changes
  useEffect(() => {
    if (mapLoaded && memoizedPins.length > 0) {
      // Add a small delay to ensure map is fully ready
      const timer = setTimeout(() => {
        renderExistingPins(onPinClick);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [memoizedPins, mapLoaded, onPinClick]);

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
