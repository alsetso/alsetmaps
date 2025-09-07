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
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [boxesCountByCity, setBoxesCountByCity] = useState<Record<string, number>>({});
  const [listingsCountByCity, setListingsCountByCity] = useState<Record<string, number>>({});

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
  };

  // Create city marker
  const createCityMarker = (city: City) => {
    if (!map.current) return;

    // Create marker element
    const el = document.createElement('div');
    el.className = 'city-marker';
    el.style.cssText = `
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      font-weight: bold;
    `;

    // Add city initial
    el.textContent = city.name.charAt(0);

    // Create popup content
    const popupContent = `
      <div class="city-popup">
        <h3 class="font-bold text-lg text-gray-900">${city.name}</h3>
        <p class="text-sm text-gray-600">${city.state}</p>
        <p class="text-sm text-gray-500">Population: ${city.population.toLocaleString()}</p>
        <div class="flex gap-4 mt-2">
          <p class="text-sm text-blue-600 font-medium">Buy Boxes: ${city.boxesCount || 0}</p>
          <p class="text-sm text-green-600 font-medium">Listings: ${city.listingsCount || 0}</p>
        </div>
        <p class="text-xs text-gray-400">${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}</p>
      </div>
    `;

    // Create marker with popup
    const marker = new mapboxgl.Marker(el)
      .setLngLat([city.longitude, city.latitude])
      .setPopup(
        new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'city-popup-container'
        }).setHTML(popupContent)
      )
      .addTo(map.current);

    // Add click event to marker
    el.addEventListener('click', () => {
      handleCityClick(city);
    });

    return marker;
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

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-93.3, 45.0], // Center on Minneapolis
        zoom: 8, // Zoom level to show all Minnesota cities
        maxBounds: minnesotaBounds,
        fitBoundsOptions: {
          padding: 30
        }
      });

      // Wait for map to load, then add markers
      map.current.on('load', () => {
        console.log('Map loaded on homepage, adding city markers');
        
        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add markers for each city
        cities.forEach(city => {
          const marker = createCityMarker(city);
          if (marker) {
            markers.current.push(marker);
          }
        });

        console.log(`Added ${markers.current.length} city markers to homepage map`);
      });

      // Add error handling
      map.current.on('error', (e) => {
        console.error('Map error on homepage:', e);
      });
    };

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clean up markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
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
    <div className="w-screen">
      <TopBar showSearchByDefault={false} showSearchIcon={false} />
      
      {/* Fixed Map Container - 50vh height */}
      <div 
        ref={mapContainer} 
        className="w-full fixed left-0 z-0"
        style={{ 
          top: '60px',
          height: '50vh',
          width: '100vw'
        }}
      />

      {/* Scrollable Content - No height constraints, full content height */}
      <div className="relative z-10" style={{ marginTop: '60px' }}>
        {/* Spacer to push cities panel to bottom initially */}
        <div style={{ height: '50vh' }}></div>
        
        {/* Cities Panel - Full height content that scrolls over map */}
        <div className="bg-white shadow-2xl rounded-t-3xl">
          <div className="p-6">
            {/* Handle bar for visual indication */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Minnesota Cities</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {cities.length} cities loaded • {Object.values(boxesCountByCity).reduce((sum, count) => sum + count, 0)} buy boxes • {Object.values(listingsCountByCity).reduce((sum, count) => sum + count, 0)} listings • Click on a city to view it on the map
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Scroll to explore</div>
                <div className="text-xs text-gray-400">↑ Cities scroll over the map</div>
              </div>
            </div>
            
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
                        ✓ Selected - View on map behind
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
            
            {/* Bottom padding to ensure all content is scrollable */}
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
