'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from './components/TopBar';
import { supabase } from '@/integrations/supabase/client';
import mapboxgl from 'mapbox-gl';

interface City {
  id: number;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  boxesCount?: number;
  listingsCount?: number;
}

export default function HomePage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [boxesCountByCity, setBoxesCountByCity] = useState<Record<string, number>>({});
  const [listingsCountByCity, setListingsCountByCity] = useState<Record<string, number>>({});
  const [consoleHeight, setConsoleHeight] = useState(300); // Default console height
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);

  // Minnesota bounds coordinates [west, south, east, north]
  const minnesotaBounds: [number, number, number, number] = [
    -97.239209, 43.499356, -89.491982, 49.384358
  ];

  // Fetch both cities and boxes count in parallel for better performance
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch cities, boxes count, and listings count in parallel
        const [citiesResponse, boxesResponse, listingsResponse] = await Promise.all([
          supabase
            .from('cities')
            .select('id, name, state, latitude, longitude, population')
            .eq('state', 'MN')
            .order('name'),
          fetch('/api/boxes/count-by-city'),
          fetch('/api/listings/count-by-city')
        ]);

        // Process cities data
        if (citiesResponse.error) {
          console.error('Error fetching cities:', citiesResponse.error);
          setError('Failed to load cities data');
          setCities([]);
        } else {
          const citiesData = citiesResponse.data || [];
          setCities(citiesData);
        }

        // Process boxes count data
        const boxesResult = await boxesResponse.json();
        if (boxesResult.success) {
          setBoxesCountByCity(boxesResult.data);
        } else {
          console.error('Failed to fetch boxes count:', boxesResult.error);
          setBoxesCountByCity({});
        }

        // Process listings count data
        const listingsResult = await listingsResponse.json();
        if (listingsResult.success) {
          setListingsCountByCity(listingsResult.data);
        } else {
          console.error('Failed to fetch listings count:', listingsResult.error);
          setListingsCountByCity({});
        }

        // Update cities with both boxes and listings count
        if (citiesResponse.data) {
          const citiesWithCounts = citiesResponse.data.map(city => ({
            ...city,
            boxesCount: boxesResult.success ? (boxesResult.data[city.name] || 0) : 0,
            listingsCount: listingsResult.success ? (listingsResult.data[city.name] || 0) : 0
          }));
          setCities(citiesWithCounts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
        setCities([]);
        setBoxesCountByCity({});
        setListingsCountByCity({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fly to a specific city
  const flyToCity = (city: City) => {
    if (map.current) {
      map.current.flyTo({
        center: [city.longitude, city.latitude],
        zoom: 12,
        duration: 2000
      });
    }
  };

  // Function to handle city click
  const handleCityClick = (city: City) => {
    setSelectedCity(city);
    flyToCity(city);
    
    // Create and show popup
    if (map.current) {
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: 'city-popup-container'
      })
        .setLngLat([city.longitude, city.latitude])
        .setHTML(`
          <div class="city-popup" style="min-width: 200px;">
            <h3 class="font-bold text-lg text-gray-900 mb-1">${city.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${city.state}</p>
            <p class="text-sm text-gray-500 mb-3">Population: ${city.population.toLocaleString()}</p>
            <div class="flex gap-4 mb-3">
              <div class="text-center">
                <p class="text-lg font-bold text-blue-600">${city.boxesCount || 0}</p>
                <p class="text-xs text-gray-500">Buy Boxes</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-bold text-green-600">${city.listingsCount || 0}</p>
                <p class="text-xs text-gray-500">Listings</p>
              </div>
            </div>
            <div class="text-center">
              <button 
                onclick="window.handleCityClickFromPopup('${city.name}')" 
                class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200"
                style="cursor: pointer;"
              >
                View Details
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-2 text-center">${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}</p>
          </div>
        `)
        .addTo(map.current);
    }
  };

  // Global function for popup button clicks
  useEffect(() => {
    (window as any).handleCityClickFromPopup = (cityName: string) => {
      const city = cities.find(c => c.name === cityName);
      if (city) {
        handleCityClick(city);
      }
    };

    return () => {
      delete (window as any).handleCityClickFromPopup;
    };
  }, [cities]);

  // Console panel resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newHeight = window.innerHeight - e.clientY;
      const minHeight = 100;
      const maxHeight = window.innerHeight - 100;
      
      setConsoleHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleConsole = () => {
    setIsConsoleCollapsed(!isConsoleCollapsed);
  };

  // Keyboard shortcut to toggle console (Ctrl/Cmd + `)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleConsole();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isConsoleCollapsed]);

  // Convert cities to GeoJSON format
  const citiesToGeoJSON = (cities: City[]) => {
    return {
      type: 'FeatureCollection' as const,
      features: cities.map(city => ({
        type: 'Feature' as const,
        properties: {
          id: city.id.toString(),
          name: city.name,
          state: city.state,
          population: city.population,
          boxesCount: city.boxesCount || 0,
          listingsCount: city.listingsCount || 0,
          initial: city.name.charAt(0).toUpperCase()
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [city.longitude, city.latitude]
        }
      }))
    };
  };

  // Add cities as GeoJSON source and symbol layer
  const addCitiesToMap = (cities: City[]) => {
    if (!map.current) return;

    const geojson = citiesToGeoJSON(cities);

    // Add source
    if (map.current.getSource('cities')) {
      (map.current.getSource('cities') as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.current.addSource('cities', {
        type: 'geojson',
        data: geojson
      });
    }

    // Add symbol layer for city markers
    if (!map.current.getLayer('city-markers')) {
      map.current.addLayer({
        id: 'city-markers',
        type: 'symbol',
        source: 'cities',
        layout: {
          'text-field': ['get', 'initial'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center',
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#3b82f6',
          'text-halo-width': 2
        }
      });
    }

    // Add circle layer for city backgrounds
    if (!map.current.getLayer('city-circles')) {
      map.current.addLayer({
        id: 'city-circles',
        type: 'circle',
        source: 'cities',
        paint: {
          'circle-color': '#3b82f6',
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false], 12,
            ['boolean', ['feature-state', 'selected'], false], 10,
            8
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.9
        }
      });
    }
  };

  // Initialize map and add markers
  useEffect(() => {
    if (map.current || cities.length === 0) return;

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is not set. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables.');
      return;
    }

    // Small delay to ensure container is properly rendered
    const initMap = () => {
      if (!mapContainer.current) {
        console.error('Map container not found');
        return;
      }

      console.log('Initializing map on homepage, container:', mapContainer.current);

      // Initialize map with interactive controls
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-93.3, 45.0], // Center on Minneapolis
        zoom: 8, // Zoom level to show all Minnesota cities
        maxBounds: minnesotaBounds,
        fitBoundsOptions: {
          padding: 30
        },
        // Enable interactive features
        interactive: true,
        dragPan: true,
        dragRotate: true,
        scrollZoom: true,
        boxZoom: true,
        doubleClickZoom: true,
        keyboard: true,
        touchZoomRotate: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Wait for map to load, then add cities
      map.current.on('load', () => {
        console.log('Map loaded on homepage, adding city data');
        addCitiesToMap(cities);
      });

      // Add click event for city selection
      map.current.on('click', 'city-circles', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const cityId = feature.properties?.id;
          const city = cities.find(c => c.id.toString() === cityId);
          if (city) {
            handleCityClick(city);
          }
        }
      });

      // Add hover effects
      map.current.on('mouseenter', 'city-circles', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'city-circles', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      // Add feature state for hover effects
      map.current.on('mousemove', 'city-circles', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const cityId = feature.properties?.id;
          
          // Reset all features
          if (map.current) {
            map.current.setFeatureState(
              { source: 'cities', id: feature.id },
              { hover: false }
            );
          }
          
          // Set hover state for current feature
          if (map.current && cityId) {
            map.current.setFeatureState(
              { source: 'cities', id: feature.id },
              { hover: true }
            );
            setHoveredCityId(cityId);
          }
        }
      });

      // Reset hover state when leaving the layer
      map.current.on('mouseleave', 'city-circles', () => {
        if (map.current && hoveredCityId) {
          const geojson = citiesToGeoJSON(cities);
          geojson.features.forEach((feature, index) => {
            if (feature.properties?.id === hoveredCityId) {
              map.current?.setFeatureState(
                { source: 'cities', id: index },
                { hover: false }
              );
            }
          });
          setHoveredCityId(null);
        }
      });

      // Add error handling
      map.current.on('error', (e) => {
        console.error('Map error on homepage:', e);
      });

      // Add map click event to deselect cities (when clicking on empty map)
      map.current.on('click', (e) => {
        // Check if click was on a city circle
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['city-circles']
        });
        
        // Only deselect if clicking on empty map area
        if (!features || features.length === 0) {
          setSelectedCity(null);
        }
      });

      // Add map move event to update selected city if it goes out of view
      map.current.on('moveend', () => {
        if (selectedCity && map.current) {
          const bounds = map.current.getBounds();
          const cityLngLat: [number, number] = [selectedCity.longitude, selectedCity.latitude];
          
          if (!bounds.contains(cityLngLat)) {
            // City is out of view, keep it selected but don't auto-fly to it
            console.log('Selected city is out of view:', selectedCity.name);
          }
        }
      });
    };

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clean up is handled automatically by Mapbox GL JS
    };
  }, [cities]);

  if (loading) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <TopBar showSearchByDefault={false} showSearchIcon={false} />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 60px)', marginTop: '60px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cities and box counts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <TopBar showSearchByDefault={false} showSearchIcon={false} />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 60px)', marginTop: '60px' }}>
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopBar showSearchByDefault={false} showSearchIcon={false} />
      
      {/* Add custom styles for map interactions */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          border: none !important;
          padding: 16px !important;
        }
        
        .mapboxgl-popup-tip {
          border-top-color: white !important;
        }
        
        .mapboxgl-ctrl-group {
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }
        
        .mapboxgl-ctrl-group button {
          border-radius: 8px !important;
        }
        
        /* GeoJSON-based markers are handled by Mapbox GL JS natively */
        
        .console-panel {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }
        
        .resize-handle {
          cursor: ns-resize;
          background: linear-gradient(to right, #e5e7eb, #d1d5db, #e5e7eb);
        }
        
        .resize-handle:hover {
          background: linear-gradient(to right, #d1d5db, #9ca3af, #d1d5db);
        }
      `}</style>
      
      {/* Full Screen Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full absolute inset-0"
        style={{ 
          top: '60px',
          height: 'calc(100vh - 60px)',
          width: '100vw',
          zIndex: 1
        }}
      />

      {/* Console Panel - Slides up from bottom */}
      <div 
        className="console-panel fixed bottom-0 left-0 right-0 border-t border-gray-200 shadow-2xl transition-all duration-300 ease-in-out"
        style={{ 
          height: isConsoleCollapsed ? '60px' : `${consoleHeight}px`,
          zIndex: 10
        }}
      >
        {/* Resize Handle */}
        <div 
          className="resize-handle h-2 w-full flex items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
        </div>
        
        {/* Console Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Minnesota Cities</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {cities.length} cities
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {Object.values(boxesCountByCity).reduce((sum, count) => sum + count, 0)} buy boxes
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {Object.values(listingsCountByCity).reduce((sum, count) => sum + count, 0)} listings
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleConsole}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title={isConsoleCollapsed ? 'Expand console' : 'Collapse console'}
            >
              {isConsoleCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Console Content - Scrollable */}
        {!isConsoleCollapsed && (
          <div className="h-full overflow-y-auto" style={{ height: `calc(100% - 60px)` }}>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cities.map(city => (
                  <div 
                    key={city.id} 
                    className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCity?.id === city.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCityClick(city)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{city.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {city.state}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Population:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {city.population.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Buy Boxes:</span>
                        <span className="text-sm font-bold text-blue-600">
                          {city.boxesCount || 0}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Listings:</span>
                        <span className="text-sm font-bold text-green-600">
                          {city.listingsCount || 0}
                        </span>
                      </div>
                    </div>
                    
                    {selectedCity?.id === city.id && (
                      <div className="mt-3 pt-2 border-t border-blue-200">
                        <p className="text-xs text-blue-600 font-medium mb-3">
                          ✓ Selected - View on map above
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/buy?state=${encodeURIComponent(city.state)}&city=${encodeURIComponent(city.name)}`)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
                          >
                            <span>🏠</span>
                            Buy Here
                          </button>
                          <button
                            onClick={() => router.push(`/sell?state=${encodeURIComponent(city.state)}&city=${encodeURIComponent(city.name)}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
                          >
                            <span>💰</span>
                            Sell Here
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
