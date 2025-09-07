'use client';

import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

interface Pin {
  id: string;
  lng: number;
  lat: number;
  radius: number; // in meters
}

export default function TestBuyPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map()); // Store markers by pin ID
  const [pins, setPins] = useState<Pin[]>([]);
  const [radius, setRadius] = useState<number>(1000); // Default 1km radius

  // Add CSS styles once when component mounts
  useEffect(() => {
    if (!document.getElementById('pin-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'pin-animation-styles';
      style.textContent = `
        @keyframes pulse {
          0% {
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.1);
          }
          100% {
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
        }
        .pin-marker {
          background-color: #3b82f6;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 4px rgba(59, 130, 246, 0.2);
          cursor: pointer;
          position: relative;
          animation: pulse 2s infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Minnesota bounds coordinates [west, south, east, north]
  const minnesotaBounds: [number, number, number, number] = [
    -97.239209, 43.499356, -89.491982, 49.384358
  ];

  // Function to create a blue pin marker
  const createPinMarker = (pin: Pin) => {
    if (!map.current) return null;

    const el = document.createElement('div');
    el.className = 'pin-marker';
    el.dataset.pinId = pin.id; // Store pin ID for removal

    // Add a small inner dot for better visibility
    const innerDot = document.createElement('div');
    innerDot.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      background-color: white;
      border-radius: 50%;
    `;
    el.appendChild(innerDot);

    // Create marker with center anchor point to ensure it stays centered
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center' // This ensures the marker is centered on the coordinates
    })
      .setLngLat([pin.lng, pin.lat])
      .addTo(map.current);

    // Add click handler to remove pin
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      removePin(pin.id);
    });

    // Store marker reference
    markers.current.set(pin.id, marker);

    return marker;
  };

  // Function to create radius circle
  const createRadiusCircle = (pin: Pin) => {
    if (!map.current) return;

    const sourceId = `circle-${pin.id}`;
    const layerId = `circle-layer-${pin.id}`;

    // Remove existing circle if it exists
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Create circle geometry
    const circle = turf.circle([pin.lng, pin.lat], pin.radius, {
      steps: 64,
      units: 'meters'
    });

    // Add circle source and layer
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: circle
    });

    map.current.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.1
      }
    });

    map.current.addLayer({
      id: `${layerId}-stroke`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-opacity': 0.6
      }
    });
  };

  // Function to add a new pin
  const addPin = (lng: number, lat: number) => {
    const newPin: Pin = {
      id: `pin-${Date.now()}`,
      lng,
      lat,
      radius
    };

    setPins(prevPins => [...prevPins, newPin]);
  };

  // Function to remove a pin
  const removePin = (pinId: string) => {
    if (!map.current) return;

    // Remove marker using stored reference
    const marker = markers.current.get(pinId);
    if (marker) {
      marker.remove();
      markers.current.delete(pinId);
    }

    // Remove circle layers
    const sourceId = `circle-${pinId}`;
    const layerId = `circle-layer-${pinId}`;
    
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getLayer(`${layerId}-stroke`)) {
      map.current.removeLayer(`${layerId}-stroke`);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    setPins(prevPins => prevPins.filter(pin => pin.id !== pinId));
  };

  // Function to clear all pins
  const clearAllPins = () => {
    if (!map.current) return;

    // Remove all markers using stored references
    markers.current.forEach((marker) => {
      marker.remove();
    });
    markers.current.clear();

    // Remove all circle layers
    pins.forEach(pin => {
      const sourceId = `circle-${pin.id}`;
      const layerId = `circle-layer-${pin.id}`;
      
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current?.getLayer(`${layerId}-stroke`)) {
        map.current.removeLayer(`${layerId}-stroke`);
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });

    setPins([]);
  };

  // Function to update radius for all pins
  const updateRadius = (newRadius: number) => {
    setRadius(newRadius);
    setPins(prevPins => 
      prevPins.map(pin => ({ ...pin, radius: newRadius }))
    );
  };

  // Function to update radius for a specific pin
  const updatePinRadius = (pinId: string, newRadius: number) => {
    setPins(prevPins => 
      prevPins.map(pin => 
        pin.id === pinId ? { ...pin, radius: newRadius } : pin
      )
    );
  };

  // Re-render pins when pins array changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers using stored references
    markers.current.forEach((marker) => {
      marker.remove();
    });
    markers.current.clear();

    // Clear existing circles
    pins.forEach(pin => {
      const sourceId = `circle-${pin.id}`;
      const layerId = `circle-layer-${pin.id}`;
      
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current?.getLayer(`${layerId}-stroke`)) {
        map.current.removeLayer(`${layerId}-stroke`);
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });

    // Add new markers and circles
    pins.forEach(pin => {
      createPinMarker(pin);
      createRadiusCircle(pin);
    });
  }, [pins]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once and ensure container exists
    
    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is not set. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables.');
      return;
    }

    console.log('Initializing map with token:', mapboxgl.accessToken ? 'Available' : 'Missing');

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        bounds: minnesotaBounds,
        maxBounds: minnesotaBounds,
        fitBoundsOptions: {
          padding: 50
        }
      });

      // Wait for map to load before setting up event listeners
      map.current.on('load', () => {
        console.log('Map loaded successfully, setting up click handler');
        
        // Add click handler to drop pins
        map.current!.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          console.log('Map clicked at:', lng, lat);
          addPin(lng, lat);
        });

        // Change cursor on hover
        map.current!.on('mouseenter', () => {
          map.current!.getCanvas().style.cursor = 'crosshair';
        });

        map.current!.on('mouseleave', () => {
          map.current!.getCanvas().style.cursor = '';
        });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      // Clean up markers
      markers.current.forEach((marker) => {
        marker.remove();
      });
      markers.current.clear();
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen relative">
      <TopBar showSearchByDefault={false} showSearchIcon={false} />
      
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ 
          marginTop: '60px', 
          height: 'calc(100vh - 60px)',
          minHeight: '400px'
        }}
      />

      {/* Control Panel */}
      <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg p-4 z-10 min-w-[280px] max-w-[320px] max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pin Controls</h3>
        
        {/* Global Radius Control */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Radius: {radius}m
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={radius}
            onChange={(e) => updateRadius(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>100m</span>
            <span>5km</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Sets radius for new pins</p>
        </div>

        {/* Pin Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Pins placed: <span className="font-semibold">{pins.length}</span>
          </p>
        </div>

        {/* Individual Pin Controls */}
        {pins.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-800 mb-3">Individual Pins</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {pins.map((pin, index) => (
                <div key={pin.id} className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-sm font-medium text-blue-900">Pin #{index + 1}</h5>
                    <button
                      onClick={() => removePin(pin.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="text-xs text-blue-700 mb-2">
                    <div>Lat: {pin.lat.toFixed(6)}</div>
                    <div>Lng: {pin.lng.toFixed(6)}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-blue-800 mb-1">
                      Radius: {pin.radius}m
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={pin.radius}
                      onChange={(e) => updatePinRadius(pin.id, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-blue-600 mt-1">
                      <span>100m</span>
                      <span>5km</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clear Button */}
        <button
          onClick={clearAllPins}
          disabled={pins.length === 0}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Clear All Pins
        </button>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Instructions:</strong><br />
            • Click anywhere on the map to place a blue pin<br />
            • Click on a pin to remove it<br />
            • Adjust individual pin radius with sliders<br />
            • Default radius applies to new pins
          </p>
        </div>
      </div>
    </div>
  );
}
