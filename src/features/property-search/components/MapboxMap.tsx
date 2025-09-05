'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '@/features/authentication/components/AuthProvider';

// Extend Window interface to include map methods
declare global {
  interface Window {
    flyToLocation?: (lat: number, lng: number, zoom?: number) => void;
    dropPin?: (lat: number, lng: number, address?: string) => void;
    clearSearchResultPin?: () => void;
    clearTempPin?: () => void;
    handleViewProperty?: (pinId: string) => void;
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
  onViewProperty?: (pin: Pin) => void;
  onSmartSearchUpgrade?: (searchHistoryId: string) => void;
  onShowSmartSearch?: () => void;
  onMapReady?: (map: mapboxgl.Map) => void;
  onTempPinCreate?: (lat: number, lng: number, address?: string) => void;
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
  onViewProperty,
  onSmartSearchUpgrade,
  onShowSmartSearch,
  onMapReady,
  onTempPinCreate,
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



  // Optimized method to clear search result pin
  const clearSearchResultPin = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    try {
      // Remove layers efficiently
      const layersToRemove = ['search-result-pin-layer', 'search-result-pin-label'];
      layersToRemove.forEach(layerId => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });
      
      // Remove source
      if (map.current.getSource('search-result-pin')) {
        map.current.removeSource('search-result-pin');
      }
    } catch (error) {
      console.error('Error clearing search result pin:', error);
    }
  }, [mapLoaded]);

  // Method to handle view property button click
  const handleViewProperty = useCallback((pinId: string) => {
    if (onViewProperty) {
      // Find the full pin data from the pins array
      const fullPin = pins.find(p => p.id === pinId);
      if (fullPin) {
        onViewProperty(fullPin);
      }
    }
  }, [onViewProperty, pins]);

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

  // Optimized method to render existing user pins
  const renderExistingPins = useCallback((onPinClick?: (pin: Pin) => void) => {
    if (!map.current || !mapLoaded) return;

    // Early return if style not loaded - will be handled by map load event
    if (!map.current.isStyleLoaded()) return;

    try {
      // Clear existing pins efficiently
      clearExistingPins();

      // Create optimized GeoJSON features
      const pinFeatures = pins.map(pin => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [pin.longitude, pin.latitude]
        },
        properties: {
          id: pin.id,
          name: pin.name,
          hasNotes: !!pin.notes,
          hasImages: !!(pin.images && pin.images.length > 0)
        }
      }));

      // Add source with optimized data
      map.current.addSource('user-pins', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pinFeatures
        }
      });

      // Add simplified pin markers layer
      map.current.addLayer({
        id: 'user-pins-markers',
        type: 'circle',
        source: 'user-pins',
        paint: {
          'circle-radius': 8,
          'circle-color': '#10B981',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }
      });

      // Add simplified labels (only show on zoom > 12 for performance)
      map.current.addLayer({
        id: 'user-pins-labels',
        type: 'symbol',
        source: 'user-pins',
        minzoom: 12,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
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

      // Simplified click handler
      const handlePinClick = (e: any) => {
        if (!e.features?.[0]) return;
        
        const pin = e.features[0];
        const coordinates = pin.geometry.coordinates.slice();
        const fullPin = pins.find(p => p.id === pin.properties?.id);
        
        if (fullPin) {
          flyToLocation(coordinates[1], coordinates[0], 16);
          onPinClick?.(fullPin);
        }
      };

      // Add event listeners (only once)
      map.current.off('click', 'user-pins-markers', handlePinClick);
      map.current.on('click', 'user-pins-markers', handlePinClick);

      // Simplified hover effects
      const handleMouseEnter = () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      };
      const handleMouseLeave = () => {
        map.current!.getCanvas().style.cursor = '';
      };
      
      map.current.off('mouseenter', 'user-pins-markers', handleMouseEnter);
      map.current.off('mouseleave', 'user-pins-markers', handleMouseLeave);
      
      map.current.on('mouseenter', 'user-pins-markers', handleMouseEnter);
      map.current.on('mouseleave', 'user-pins-markers', handleMouseLeave);

    } catch (error) {
      console.error('Error rendering pins:', error);
    }
  }, [mapLoaded, pins, flyToLocation, clearExistingPins]);

  // Optimized method to drop a pin at specific coordinates
  const dropPin = useCallback((lat: number, lng: number, address?: string) => {
    if (!map.current || !mapLoaded) return;

    clearSearchResultPin();
    
    // Simplified pin source
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
    
    // Simplified pin layer
    map.current.addLayer({
      id: 'search-result-pin-layer',
      type: 'circle',
      source: 'search-result-pin',
      paint: {
        'circle-radius': 10,
        'circle-color': '#3B82F6',
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 3
      }
    });

    // Simplified label (only show on zoom > 10)
    map.current.addLayer({
      id: 'search-result-pin-label',
      type: 'symbol',
      source: 'search-result-pin',
      minzoom: 10,
      layout: {
        'text-field': ['get', 'address'],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': 14,
        'text-offset': [0, 1.8],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#1F2937',
        'text-halo-color': '#FFFFFF',
        'text-halo-width': 2
      }
    });
  }, [mapLoaded, clearSearchResultPin]);

  // Method to drop a temporary pin for map clicks
  const dropTempPin = useCallback((lat: number, lng: number, address?: string) => {
    if (!map.current || !mapLoaded) return;

    clearTempPin();
    
    // Add temporary pin source
    map.current.addSource('temp-pin', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          address: address || 'New Pin Location'
        }
      }
    });
    
    // Add temporary pin layer with distinct styling
    map.current.addLayer({
      id: 'temp-pin-layer',
      type: 'circle',
      source: 'temp-pin',
      paint: {
        'circle-radius': 12,
        'circle-color': '#F59E0B', // Amber color for temporary pin
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 3,
        'circle-opacity': 0.9
      }
    });

    // Add pulsing effect for temporary pin
    map.current.addLayer({
      id: 'temp-pin-pulse',
      type: 'circle',
      source: 'temp-pin',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12, 20,
          16, 30
        ],
        'circle-color': '#F59E0B',
        'circle-opacity': 0.3,
        'circle-stroke-color': '#F59E0B',
        'circle-stroke-width': 2,
        'circle-stroke-opacity': 0.5
      }
    });
  }, [mapLoaded]);

  // Method to clear temporary pin
  const clearTempPin = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    try {
      // Remove temporary pin layers
      const tempPinLayers = ['temp-pin-layer', 'temp-pin-pulse'];
      tempPinLayers.forEach(layerId => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });
      
      // Remove temporary pin source
      if (map.current.getSource('temp-pin')) {
        map.current.removeSource('temp-pin');
      }
    } catch (error) {
      console.error('Error clearing temporary pin:', error);
    }
  }, [mapLoaded]);



  // Expose methods globally for other components to use
  useEffect(() => {
    if (map.current && mapLoaded) {
      // @ts-ignore - Adding methods to window for global access
      window.flyToLocation = flyToLocation;
      window.dropPin = dropPin;
      window.clearSearchResultPin = clearSearchResultPin;
      window.clearTempPin = clearTempPin;
      window.handleViewProperty = handleViewProperty;
      window.handleSmartSearchUpgrade = handleSmartSearchUpgrade;
      window.showSmartSearch = showSmartSearch;
      
      // Also call onMapReady callback if provided
      if (onMapReady) {
        onMapReady(map.current);
      }
    }
  }, [mapLoaded, onMapReady, handleViewProperty, handleSmartSearchUpgrade, showSmartSearch, clearTempPin]);

  // Optimized map initialization - only runs once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with optimized settings
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
      fadeDuration: 200, // Reduced for faster transitions
      renderWorldCopies: false, // Performance optimization
      preserveDrawingBuffer: true // Better performance
    });

    // Enhanced map click handler with temporary pin functionality
    const handleMapClick = async (e: any) => {
      // Quick check for pin clicks
      const features = map.current?.queryRenderedFeatures(e.point, {
        layers: ['user-pins-markers']
      }) || [];
      
      if (features.length > 0) return; // Let pin handler deal with it

      const { lng: clickLng, lat: clickLat } = e.lngLat;
      const currentZoom = map.current?.getZoom() || 0;

      // Check if zoom level is 12 or higher for temporary pin
      if (currentZoom >= 12) {
        // Get address for the clicked location
        let address = `${clickLat.toFixed(6)}, ${clickLng.toFixed(6)}`;
        
        try {
          // Try to get a more readable address
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${clickLng},${clickLat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=address,poi`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              address = data.features[0].place_name;
            }
          }
        } catch (error) {
          console.log('Could not get address for clicked location, using coordinates');
        }

        // Drop temporary pin and trigger modal
        dropTempPin(clickLat, clickLng, address);
        onTempPinCreate?.(clickLat, clickLng, address);
        return;
      }

      onMapClick?.();

      // Simplified address selection for lower zoom levels
      if (onAddressSelect) {
        onAddressSelect(`${clickLat}, ${clickLng}`, clickLat, clickLng);
      }
    };

    // Simplified double-click handler
    const handleDoubleClick = (e: any) => {
      if (onPinCreate) {
        const { lng: clickLng, lat: clickLat } = e.lngLat;
        onPinCreate(clickLat, clickLng);
      }
    };

    // Add event listeners
    map.current.on('click', handleMapClick);
    map.current.on('dblclick', handleDoubleClick);

    // Optimized map load handler
    map.current.on('load', () => {
      setMapLoaded(true);
      // Render pins immediately without timeout
      renderExistingPins(onPinClick);
    });

    // Address selection event listener
    const handleAddressSelect = (event: CustomEvent) => {
      const { lat, lng, address } = event.detail;
      if (lat && lng) {
        flyToLocation(lat, lng, 15);
        if (map.current && mapLoaded) {
          clearSearchResultPin();
          dropPin(lat, lng, address);
        }
      }
    };

    window.addEventListener('addressSelect', handleAddressSelect as EventListener);

    return () => {
      window.removeEventListener('addressSelect', handleAddressSelect as EventListener);
    };
  }, []); // Empty dependency array - only initialize once

  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setCenter([lng, lat]);
    }
  }, [lat, lng, mapLoaded]);

  // Optimized pin rendering with minimal re-renders
  const prevPinsRef = useRef<string>('');
  
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Create lightweight hash for change detection
    const currentPinsHash = pins.map(p => `${p.id}-${p.latitude}-${p.longitude}`).join('|');
    
    // Only re-render if pins actually changed
    if (currentPinsHash !== prevPinsRef.current) {
      prevPinsRef.current = currentPinsHash;
      renderExistingPins(onPinClick);
    }
  }, [pins, mapLoaded, onPinClick, renderExistingPins]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full ${className}`}
    />
  );
}
