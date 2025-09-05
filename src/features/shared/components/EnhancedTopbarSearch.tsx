'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';
import { MapboxGeocodingService } from '@/integrations/mapbox/geocoding-service';
import { BasicSearchService } from '@/features/property-search/services/basic-search-service';
import { PropertySearchService } from '@/features/property-search/services/property-search-service';
import { AddressSuggestion } from '@/integrations/mapbox/geocoding-service';
import { AccountSetupService } from '@/features/authentication/services/account-setup-service';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { PinsService } from '@/features/property-management/services/pins-service';

interface EnhancedTopbarSearchProps {
  isDark: boolean;
  onClose: () => void;
  onPinCreated?: () => void;
}

interface SearchState {
  query: string;
  suggestions: AddressSuggestion[];
  selectedSuggestion: AddressSuggestion | null;
  isSearching: boolean;
  searchType: 'basic' | 'smart';
  showSuggestions: boolean;
  showSuccess: boolean;
  showPinDropped: boolean;
  searchResult: {
    address: string;
    latitude: number;
    longitude: number;
    searchHistoryId?: string;
    smartData?: any; // Smart search data from Zillow API
  } | null;
  createdPinId: string | null;
  isLoading: boolean;
  credits: number | null;
  error: string | null;
}

export function EnhancedTopbarSearch({ isDark, onClose, onPinCreated }: EnhancedTopbarSearchProps) {
  const { user } = useAuth();
  const [state, setState] = useState<SearchState>({
    query: '',
    suggestions: [],
    selectedSuggestion: null,
    isSearching: false,
    searchType: 'basic',
    showSuggestions: false,
    showSuccess: false,
    showPinDropped: false,
    searchResult: null,
    createdPinId: null,
    isLoading: false,
    credits: null,
    error: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Fetch credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const creditBalance = await AccountSetupService.getCreditBalance();
        setState(prev => ({ ...prev, credits: creditBalance?.availableCredits || 0 }));
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      }
    };

    fetchCredits();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (query.trim().length >= 2) {
        await performGeocoding(query);
      } else {
        setState(prev => ({ ...prev, suggestions: [], showSuggestions: false }));
      }
    }, 300);
  }, []);

  // Perform geocoding based on search type
  const performGeocoding = async (query: string) => {
    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      let suggestions: AddressSuggestion[] = [];

      if (state.searchType === 'basic') {
        const basicSuggestions = await BasicSearchService.geocodeAddress(query);
        // Convert BasicSearchSuggestion to AddressSuggestion
        suggestions = basicSuggestions.map(suggestion => ({
          ...suggestion,
          properties: {
            address: suggestion.text,
            city: '',
            state: '',
            postcode: '',
            country: 'US'
          }
        }));
      } else {
        // For smart search, we'll use the basic geocoding but with enhanced context
        suggestions = await MapboxGeocodingService.searchAddresses(query, 5);
      }

      setState(prev => ({
        ...prev,
        suggestions,
        showSuggestions: suggestions.length > 0,
        isSearching: false,
        error: null,
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      setState(prev => ({
        ...prev,
        suggestions: [],
        showSuggestions: false,
        isSearching: false,
        error: 'Failed to search addresses. Please check your connection and try again.',
      }));
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setState(prev => ({ ...prev, query, error: null }));
    debouncedSearch(query);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setState(prev => ({
      ...prev,
      selectedSuggestion: suggestion,
      query: suggestion.place_name,
      showSuggestions: false,
    }));
    
    // Focus back to input for user to press Enter or click search
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Perform the actual search
  const performSearch = async (suggestion: AddressSuggestion) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let [lng, lat] = suggestion.center;
      let address = suggestion.place_name;

      // If we have a manual query without coordinates, try to geocode it first
      if (suggestion.id === 'manual-query' && (lng === 0 && lat === 0)) {
        try {
          const geocodedSuggestions = await MapboxGeocodingService.searchAddresses(address, 1);
          if (geocodedSuggestions.length > 0) {
            const geocodedSuggestion = geocodedSuggestions[0];
            [lng, lat] = geocodedSuggestion.center;
            address = geocodedSuggestion.place_name;
          } else {
            throw new Error('No geocoding results found');
          }
        } catch (geocodingError) {
          console.error('Geocoding error for manual query:', geocodingError);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: 'Could not find location. Please try a different address.'
          }));
          return;
        }
      }

      // Fly to location on map
      if (window.flyToLocation) {
        window.flyToLocation(lat, lng, 15);
      }

      // Perform property search
      const searchRequest = {
        address,
        searchType: state.searchType,
        latitude: lat,
        longitude: lng,
      };

      const result = await PropertySearchService.performSearch(searchRequest);
      console.log('🔍 PropertySearchService result:', result);

      if (result.success) {
        // Refresh credits if this was a smart search
        if (state.searchType === 'smart') {
          try {
            const creditBalance = await AccountSetupService.getCreditBalance();
            setState(prev => ({ ...prev, credits: creditBalance?.availableCredits || 0 }));
          } catch (error) {
            console.error('Failed to refresh credits:', error);
          }
        }

        // Show success state with search result
        setState(prev => ({
          ...prev,
          showSuccess: true,
          searchResult: {
            address: result.address,
            latitude: result.latitude,
            longitude: result.longitude,
            searchHistoryId: result.searchHistoryId,
            smartData: result.data?.zillowData, // Include smart search data if available
          },
          isLoading: false,
          error: null,
        }));
      } else {
        console.error('Search failed:', result.error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: result.error || 'Search failed. Please try again.'
        }));
      }
    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      }));
    }
  };

  // Handle search type toggle
  const toggleSearchType = () => {
    setState(prev => ({
      ...prev,
      searchType: prev.searchType === 'basic' ? 'smart' : 'basic',
      suggestions: [],
      showSuggestions: false,
      error: null,
    }));
  };

  // Reset form function
  const resetForm = () => {
    setState(prev => ({
      ...prev,
      query: '',
      suggestions: [],
      showSuggestions: false,
      showSuccess: false,
      showPinDropped: false,
      searchResult: null,
      createdPinId: null,
      isLoading: false,
      error: null,
    }));
  };

  // Handle dropping a pin
  const handleDropPin = async () => {
    if (!state.searchResult) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Use the working PinsService instead of the API route
      const pinData = {
        name: state.searchResult.address, // Use the address as the pin name
        latitude: state.searchResult.latitude,
        longitude: state.searchResult.longitude,
        searchHistoryId: state.searchResult.searchHistoryId,
        images: [], // No images for search-created pins
        notes: `Created from ${state.searchType} search`, // Add a note about the search type
        smartData: state.searchResult.smartData // Include smart search data if available
      };

      console.log('🔧 Creating pin with PinsService:', pinData);
      console.log('🔧 User authentication status:', { 
        isAuthenticated: !!user, 
        userId: user?.id,
        userEmail: user?.email 
      });

      const result = await PinsService.createPin(pinData);

      if (result.success && result.pin) {
        console.log('✅ Pin created successfully:', result.pin);
        
        // Call the onPinCreated callback if provided
        if (onPinCreated) {
          onPinCreated();
        }
        
        // Show pin dropped state with the created pin ID
        setState(prev => ({
          ...prev,
          showSuccess: false,
          showPinDropped: true,
          createdPinId: result.pin!.id,
          isLoading: false,
        }));
      } else {
        console.error('❌ Failed to create pin:', result.error);
        setState(prev => ({ ...prev, isLoading: false }));
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('❌ Error creating pin:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      // You could add a toast notification here
    }
  };

  // Handle back to search
  const handleBackToSearch = () => {
    setState(prev => ({
      ...prev,
      showSuccess: false,
      showPinDropped: false,
      searchResult: null,
      createdPinId: null,
    }));
  };

  // Handle closing pin dropped state
  const handleClosePinDropped = () => {
    onClose();
  };


  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && state.query.trim()) {
      // Perform search when Enter is pressed with a query
      if (state.selectedSuggestion) {
        // Use selected suggestion if available
        performSearch(state.selectedSuggestion);
      } else if (state.suggestions.length > 0) {
        // Use first suggestion if available
        performSearch(state.suggestions[0]);
      } else {
        // Create a basic suggestion from the query for geocoding
        const basicSuggestion: AddressSuggestion = {
          id: 'manual-query',
          place_name: state.query.trim(),
          text: state.query.trim(),
          center: [0, 0], // Will be updated by geocoding
          context: [],
          properties: {
            address: state.query.trim(),
            city: '',
            state: '',
            postcode: '',
            country: 'US'
          }
        };
        performSearch(basicSuggestion);
      }
    }
  };


  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking within the search container
      if (target.closest('.search-container')) {
        return;
      }
      
      if (suggestionsRef.current && !suggestionsRef.current.contains(target)) {
        setState(prev => ({ ...prev, showSuggestions: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If showing pin dropped state, render that instead
  if (state.showPinDropped && state.createdPinId) {
    return (
      <div className="search-container fixed top-16 left-0 w-screen z-[9998]">
        <div className={`
          w-full backdrop-blur-xl border-b transition-all duration-300 ease-in-out
          ${isDark 
            ? 'bg-black/80 border-white/15 shadow-2xl' 
            : 'bg-white/95 border-gray-200/60 shadow-xl'
          }
        `}>
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="max-w-4xl mx-auto">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Pin Created Successfully!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      Your property pin has been saved and is now available in your collection.
                    </p>
                  </div>
                </div>
                <div className="w-full">
                  <a
                    href={`/property/${state.createdPinId}`}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Property
                  </a>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                {/* Success Message */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Pin Created Successfully!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-md">
                        Your property pin has been saved and is now available in your collection.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center">
                  <a
                    href={`/property/${state.createdPinId}`}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Property
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If showing success state, render that instead
  if (state.showSuccess && state.searchResult) {
    return (
      <div className="search-container fixed top-16 left-0 w-screen z-[9998]">
        <div className={`
          w-full backdrop-blur-xl border-b transition-all duration-300 ease-in-out
          ${isDark 
            ? 'bg-black/80 border-white/15 shadow-2xl' 
            : 'bg-white/95 border-gray-200/60 shadow-xl'
          }
        `}>
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="max-w-4xl mx-auto">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                                      <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Search Successful!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {state.searchResult.address}
                      </p>
                    </div>
                </div>
                <div className="w-full">
                  <button
                    onClick={handleDropPin}
                    disabled={state.isLoading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {state.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Dropping Pin...
                      </>
                    ) : (
                      <>
                        <MapPinIcon className="h-4 w-4" />
                        Drop Pin
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                {/* Success Message */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Search Successful!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-md">
                        {state.searchResult.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center">
                  <button
                    onClick={handleDropPin}
                    disabled={state.isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {state.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Dropping Pin...
                      </>
                    ) : (
                      <>
                        <MapPinIcon className="h-4 w-4" />
                        Drop Pin
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-container fixed top-16 left-0 w-screen z-[9998]">
      <div className={`
        w-full backdrop-blur-xl border-b transition-all duration-300 ease-in-out
        ${isDark 
          ? 'bg-black/80 border-white/15 shadow-2xl' 
          : 'bg-white/95 border-gray-200/60 shadow-xl'
        }
      `}>
        <div className="px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Search Input */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <MagnifyingGlassIcon className={`h-6 w-6 ${state.error ? 'text-red-500' : isDark ? 'text-white/60' : 'text-gray-400'}`} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={state.query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search properties, locations, or anything..."
                    className={`
                      w-full pl-12 pr-4 py-4 text-xl font-medium bg-transparent border-none outline-none
                      placeholder:opacity-60 transition-all duration-300
                      ${state.error 
                        ? 'text-red-600 placeholder-red-400' 
                        : isDark 
                          ? 'text-white placeholder-white/60' 
                          : 'text-gray-900 placeholder-gray-500'
                      }
                    `}
                  />
                  {(state.isSearching || state.isLoading) && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Search Type Toggle */}
                <button
                  onClick={toggleSearchType}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300
                    hover:scale-105 active:scale-95
                    ${state.searchType === 'smart' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  {state.searchType === 'smart' ? (
                    <>
                      <SparklesIcon className="h-5 w-5" />
                      Smart
                    </>
                  ) : (
                    <>
                      <BoltIcon className="h-5 w-5" />
                      Basic
                    </>
                  )}
                </button>

              </div>

              {/* Error Message */}
              {state.error && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{state.error}</p>
                  <button
                    onClick={resetForm}
                    className="ml-auto text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Credits Display - Only show when Smart search is enabled */}
              {state.searchType === 'smart' && state.credits !== null && (
                <div className="absolute right-0 top-full mt-2 z-10">
                  <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    backdrop-blur-sm border transition-all duration-300
                    ${isDark
                      ? 'bg-black/60 border-white/20 text-white'
                      : 'bg-white/80 border-gray-200 text-gray-700'
                    }
                  `}>
                    <SparklesIcon className="h-4 w-4 text-purple-500" />
                    <span>{state.credits} credits</span>
                  </div>
                </div>
              )}

              {/* Suggestions Dropdown */}
              {state.showSuggestions && state.suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className={`
                    absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border backdrop-blur-xl
                    ${isDark 
                      ? 'bg-black/90 border-white/20' 
                      : 'bg-white/95 border-gray-200/60'
                    }
                  `}
                >
                  <div className="max-h-80 overflow-y-auto">
                    {state.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={`
                          w-full px-4 py-3 text-left hover:bg-opacity-10 transition-colors duration-200
                          ${isDark 
                            ? 'hover:bg-white/10 text-white' 
                            : 'hover:bg-gray-100 text-gray-900'
                          }
                          ${index === 0 ? 'rounded-t-xl' : ''}
                          ${index === state.suggestions.length - 1 ? 'rounded-b-xl' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <MapPinIcon className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-white/60' : 'text-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {suggestion.text}
                            </div>
                            <div className={`text-sm truncate ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                              {suggestion.place_name}
                            </div>
                          </div>
                          {state.searchType === 'smart' && (
                            <div className="flex-shrink-0">
                              <SparklesIcon className={`h-4 w-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
