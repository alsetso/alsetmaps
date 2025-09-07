'use client';

import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { 
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface TopBarProps {
  showSearchByDefault?: boolean;
  showSearchIcon?: boolean;
}

export function TopBar({ showSearchByDefault = false, showSearchIcon = true }: TopBarProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(showSearchByDefault);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Geocoding search function
  const searchAddresses = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      // Minnesota bounds for filtering results
      const minnesotaBounds = [-97.239209, 43.499356, -89.491982, 49.384358];
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      
      if (!accessToken) {
        console.error('Mapbox access token is not set');
        return;
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=5&types=address,poi,place&bbox=${minnesotaBounds.join(',')}`
      );
      
      if (!response.ok) {
        console.error('Geocoding API error:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      // Filter results to ensure they're within Minnesota
      const minnesotaResults = (data.features || []).filter((feature: any) => {
        const [lng, lat] = feature.center;
        return lng >= minnesotaBounds[0] && lng <= minnesotaBounds[2] &&
               lat >= minnesotaBounds[1] && lat <= minnesotaBounds[3];
      });
      
      setSuggestions(minnesotaResults);
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedSuggestion(-1);
    searchAddresses(value);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: any) => {
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
    setSelectedSuggestion(-1);
  };

  // Handle search submission (Enter key)
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('Enter pressed, suggestions:', suggestions.length, 'selected:', selectedSuggestion);
      
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        // Use selected suggestion
        const suggestion = suggestions[selectedSuggestion];
        console.log('Using selected suggestion:', suggestion);
        setSearchQuery(suggestion.place_name);
        flyToLocation(suggestion);
      } else if (suggestions.length > 0) {
        // Use first suggestion
        const suggestion = suggestions[0];
        console.log('Using first suggestion:', suggestion);
        setSearchQuery(suggestion.place_name);
        flyToLocation(suggestion);
      } else if (searchQuery.trim()) {
        // If no suggestions but user has typed something, try to geocode it
        console.log('No suggestions, trying to geocode:', searchQuery);
        geocodeAndFlyTo(searchQuery.trim());
      }
      setSuggestions([]);
      setShowSearchBar(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
    }
  };

  // Geocode a query and fly to location
  const geocodeAndFlyTo = async (query: string) => {
    try {
      const minnesotaBounds = [-97.239209, 43.499356, -89.491982, 49.384358];
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      
      if (!accessToken) {
        console.error('Mapbox access token is not set');
        return;
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=1&types=address,poi,place&bbox=${minnesotaBounds.join(',')}`
      );
      
      if (!response.ok) {
        console.error('Geocoding API error:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('Geocoding response for direct search:', data);
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        console.log('Geocoded result:', feature);
        flyToLocation(feature);
      } else {
        console.warn('No results found for:', query);
      }
    } catch (error) {
      console.error('Error geocoding:', error);
    }
  };

  // Fly to location on map
  const flyToLocation = (suggestion: any) => {
    const [lng, lat] = suggestion.center;
    console.log('Flying to location:', { lng, lat, address: suggestion.place_name });
    
    // Create and dispatch the custom event
    const event = new CustomEvent('flyToLocation', { 
      detail: { 
        lng, 
        lat, 
        zoom: 15,
        address: suggestion.place_name,
        text: suggestion.text
      } 
    });
    
    console.log('Dispatching event:', event);
    window.dispatchEvent(event);
  };

  // Focus search input when search bar opens
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px]">
          
          {/* Left - Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/buy" 
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              Buy
            </Link>
            
            <Link 
              href="/sell" 
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              Sell
            </Link>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Alset" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Right - Search and User Menu */}
          <div className="flex items-center space-x-3">
            {/* Search Icon */}
            {showSearchIcon && (
              <button
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            )}

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5" />
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {user.email}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Search Bar */}
    {showSearchBar && (
      <div className="fixed top-[60px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
                placeholder="Search for an address, place, or landmark in Minnesota..."
                className="w-full pl-12 pr-4 py-3 text-lg font-semibold text-gray-500 bg-transparent focus:outline-none placeholder-gray-400"
              />
            </div>
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      index === selectedSuggestion ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {suggestion.text}
                    </div>
                    <div className="text-sm text-gray-500">
                      {suggestion.place_name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
