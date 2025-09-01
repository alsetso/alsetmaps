'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useSearchHistory } from '@/features/property-management/hooks';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { SearchCreditService } from '@/features/credit-system/services/search-credit-service';
import { PropertySearchService } from '@/integrations/rapidapi/property-search-service';
import { SearchHistoryCreate } from '@/features/property-management/types/search-history';

// Extend Window interface to include map methods
declare global {
  interface Window {
    flyToLocation?: (lat: number, lng: number, zoom?: number) => void;
    dropPin?: (lat: number, lng: number, address?: string) => void;
    clearSearchResultPin?: () => void;
  }
}

interface AddressSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [longitude, latitude]
  context?: Array<{ text: string }>;
}

interface NewPropertySearchProps {
  onAddressSelect?: (address: string, coordinates: [number, number]) => void;
  className?: string;
}

type SearchMode = 'basic' | 'smart';

export function NewPropertySearch({ onAddressSelect, className = '' }: NewPropertySearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchMode, setSearchMode] = useState<SearchMode>('basic');
  const [creditValidation, setCreditValidation] = useState<{
    canProceed: boolean;
    message: string;
    availableCredits?: number;
  } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Hooks for search history and authentication
  const { addSearch } = useSearchHistory();
  const { user } = useAuth();

  // Validate credits when search mode changes
  useEffect(() => {
    if (searchMode === 'smart' && user?.id) {
      validateSearchCredits();
    } else if (searchMode === 'basic') {
      setCreditValidation({
        canProceed: true,
        message: 'Basic search is free'
      });
    }
  }, [searchMode, user?.id]);

  // Validate if user can perform smart search
  const validateSearchCredits = async () => {
    if (!user?.id) {
      setCreditValidation({
        canProceed: false,
        message: 'Please log in to use smart search'
      });
      return;
    }

    try {
      const validation = await SearchCreditService.validateSearchCredits(user.id, 'smart');
      setCreditValidation({
        canProceed: validation.canProceed,
        message: validation.message,
        availableCredits: validation.availableCredits
      });
    } catch (error) {
      setCreditValidation({
        canProceed: false,
        message: 'Error validating credits'
      });
    }
  };

  // Fetch address suggestions from Mapbox
  const searchAddresses = async (searchQuery: string, limit: number = 5) => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      console.error('Mapbox token not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&types=address&limit=${limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear existing search result pin when user starts typing
    if (value.trim().length === 0 && typeof window.clearSearchResultPin === 'function') {
      window.clearSearchResultPin();
    }
    
          if (value.trim().length >= 3) {
        if (searchMode === 'smart') {
          // Smart search with more comprehensive results
          searchAddresses(value, 10); // More suggestions
        } else {
          // Basic search with standard results
          searchAddresses(value, 5);
        }
      } else {
      setSuggestions([]);
      setShowSuggestions(false);
      
      // Clear search result pin when clearing input
      if (typeof window.clearSearchResultPin === 'function') {
        window.clearSearchResultPin();
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectSuggestion(suggestions[selectedIndex]);
      } else if (query.trim()) {
        handleFormSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!query.trim()) return;
    
    // If no suggestions or no selection, try to geocode the raw input
    if (suggestions.length === 0) {
      try {
        const limit = searchMode === 'smart' ? 3 : 1;
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=address&limit=${limit}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            selectSuggestion(data.features[0]);
            return;
          }
        }
        
        // If geocoding failed but we have a query, record it as a failed search attempt
        try {
          await addSearch({
            search_address: query,
            search_type: 'property_search',
            search_tier: searchMode,
            credits_consumed: searchMode === 'smart' ? 1 : 0,
            search_filters: {
              search_mode: searchMode,
              source: 'raw_input',
              geocoding_success: false,
              error: 'No geocoding results found'
            },
            user_agent: navigator.userAgent,
          });
        } catch (error) {
          console.error('Failed to record failed search attempt:', error);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        
        // Record the failed search attempt
        try {
          await addSearch({
            search_address: query,
            search_type: 'property_search',
            search_tier: searchMode,
            credits_consumed: searchMode === 'smart' ? 1 : 0,
            search_filters: {
              search_mode: searchMode,
              source: 'raw_input',
              geocoding_success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            },
            user_agent: navigator.userAgent,
          });
        } catch (searchError) {
          console.error('Failed to record failed search attempt:', searchError);
        }
      }
    }
    
    // If still no results, show error or handle gracefully
    console.log('No address found for:', query);
  };

  // Handle suggestion selection
  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    setQuery(suggestion.place_name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Prepare search history data
    const searchHistoryData: SearchHistoryCreate = {
      search_address: suggestion.place_name,
      normalized_address: suggestion.place_name,
      latitude: suggestion.center[1],
      longitude: suggestion.center[0],
      search_type: 'property_search',
      search_tier: searchMode,
      credits_consumed: searchMode === 'smart' ? 1 : 0,
      search_filters: {
        search_mode: searchMode,
        source: 'mapbox_geocoding',
        suggestion_id: suggestion.id,
        context: suggestion.context?.map(ctx => ctx.text) || []
      },
      user_agent: navigator.userAgent,
    };

    // If this is a smart search, validate credits first
    if (searchMode === 'smart') {
      if (!creditValidation?.canProceed) {
        console.error('Cannot proceed with smart search:', creditValidation?.message);
        // Optionally show a toast or modal to prompt credit purchase
        return;
      }

      // Consume credits for smart search
      try {
        const consumption = await SearchCreditService.consumeSearchCredits(user!.id, 'smart');
        if (!consumption.success) {
          console.error('Failed to consume credits:', consumption.message);
          return;
        }
        
        // Update search history data with actual credits consumed
        searchHistoryData.credits_consumed = consumption.creditsConsumed;
        
        // Perform smart search with RapidAPI
        const smartSearchResult = await PropertySearchService.performSmartSearch(
          {
            address: suggestion.place_name,
            latitude: suggestion.center[1],
            longitude: suggestion.center[0],
            searchRadius: 5 // 5 mile radius
          },
          searchHistoryData
        );

        if (smartSearchResult.success && smartSearchResult.data) {
          // Store RapidAPI data in search history
          searchHistoryData.rapid_api_data = smartSearchResult.data;
          console.log('Smart search results:', smartSearchResult.data);
        }
      } catch (error) {
        console.error('Smart search failed:', error);
        // Fall back to basic search
        searchHistoryData.search_tier = 'basic';
        searchHistoryData.credits_consumed = 0;
      }
    }

    // Record the search in search history
    try {
      await addSearch(searchHistoryData);
    } catch (error) {
      console.error('Failed to record search history:', error);
      // Don't block the user experience if search history fails
    }
    
    // Emit custom event for map to listen to
    const addressSelectEvent = new CustomEvent('addressSelect', {
      detail: {
        lat: suggestion.center[1],
        lng: suggestion.center[0],
        address: suggestion.place_name
      }
    });
    window.dispatchEvent(addressSelectEvent);
    
    // Fly to the selected location and drop a pin on the map
    if (typeof window.flyToLocation === 'function') {
      window.flyToLocation(suggestion.center[1], suggestion.center[0], 15);
    }
    
    // Drop a pin at the selected location
    if (typeof window.dropPin === 'function') {
      window.dropPin(suggestion.center[1], suggestion.center[0], suggestion.place_name);
    }
    
    console.log('Selected address:', suggestion.place_name, 'Coordinates:', suggestion.center);
    
    // Call the onAddressSelect callback if provided
    if (onAddressSelect) {
      onAddressSelect(suggestion.place_name, suggestion.center);
    }
  };

  // Format address for display
  const formatAddress = (result: AddressSuggestion) => {
    const mainText = result.text;
    const context = result.context?.map(ctx => ctx.text).join(', ');
    return context ? `${mainText}, ${context}` : mainText;
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full max-w-2xl mx-auto px-4 md:px-0 ${className}`}>
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            placeholder="Search for an address..."
            className="w-full min-w-[400px] md:min-w-[600px] px-4 md:px-6 py-3 md:py-4 pl-4 md:pl-6 pr-20 md:pr-16 text-base md:text-lg bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute right-24 md:right-20 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Smart Toggle Button for Intelligence */}
          <button
            onClick={() => setSearchMode(searchMode === 'basic' ? 'smart' : 'basic')}
            className={`absolute right-20 md:right-16 top-1/2 transform -translate-y-1/2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all duration-200 hover:scale-105 text-sm md:text-base ${
              searchMode === 'basic' 
                ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-300 font-medium' 
                : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50 font-medium'
            }`}
            title={searchMode === 'basic' ? 'Enable Smart Search' : 'Disable Smart Search'}
          >
            Smart
          </button>
          
          {/* Submit Button */}
          <button
            onClick={handleFormSubmit}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1.5 md:p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <PaperAirplaneIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
        
        {/* Search Mode Status */}
        {searchMode === 'smart' && (
          <div className="mt-2 text-xs text-center">
            {creditValidation ? (
              <span className={`px-2 py-1 rounded-full ${
                creditValidation.canProceed 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {creditValidation.message}
                {creditValidation.availableCredits !== undefined && (
                  <span className="ml-1">({creditValidation.availableCredits} credits)</span>
                )}
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                Validating credits...
              </span>
            )}
          </div>
        )}

        {/* Address Suggestions - ABOVE the input */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200
                  ${index === selectedIndex ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}
                  ${index === 0 ? 'rounded-t-xl' : ''}
                  ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}
                `}
              >
                <div className="flex items-start space-x-3">
                  <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {suggestion.text}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {formatAddress(suggestion)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
