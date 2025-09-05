'use client';

import { useState, useRef, useEffect } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/features/shared/components/ui/form';
import { Input } from '@/features/shared/components/ui/input';
import { MapboxGeocodingService, type AddressSuggestion } from '@/integrations/mapbox';
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useFormContext } from 'react-hook-form';

interface AddressAutocompleteInputProps {
  onAddressSelect: (address: AddressSuggestion) => void;
}

export function AddressAutocompleteInput({ onAddressSelect }: AddressAutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { setValue } = useFormContext();

  // Watch form values to sync with address fields

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2) {
        searchAddresses(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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

  const searchAddresses = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await MapboxGeocodingService.searchAddresses(searchQuery, 5);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Failed to search addresses:', error);
      setSuggestions([]);
      setError('Failed to search addresses. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setValue('propertyAddress', value);
    setError(null); // Clear error when user starts typing
  };

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
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const { address, city, state, zipCode } = MapboxGeocodingService.extractAddressComponents(suggestion.place_name);
    
    // Update form values
    setValue('propertyAddress', address);
    setValue('city', city);
    setValue('state', state);
    setValue('zipCode', zipCode);
    
    // Update query to show selected address
    setQuery(suggestion.place_name);
    
    // Close suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Call the callback with the selected suggestion
    onAddressSelect(suggestion);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <FormItem>
        <FormLabel>Property Address</FormLabel>
        <FormControl>
          <div className="relative">
            <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Start typing an address..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              className={`pl-10 pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
              </div>
            )}
            {!isLoading && query && (
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
          </div>
        </FormControl>
        {error && (
          <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        <FormMessage />
      </FormItem>

      {/* Address Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`
                px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors
                ${index === selectedIndex ? 'bg-red-50 border-l-4 border-l-red-500' : ''}
              `}
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="font-medium text-gray-900">{suggestion.text}</div>
              <div className="text-sm text-gray-600">{suggestion.place_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
