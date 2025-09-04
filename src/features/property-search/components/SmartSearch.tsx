"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PropertySearchService } from '@/features/property-search/services/property-search-service';
import { BasicSearchService, BasicSearchSuggestion } from '@/features/property-search/services/basic-search-service';
import { SmartSearchService, SmartSearchSuggestion, SmartSearchAddress } from '@/features/property-search/services/smart-search-service';
import { PinsService } from '@/features/property-management/services/pins-service';


import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Card, CardContent, CardHeader } from '@/features/shared/components/ui/card';
import { MapPin, Search as SearchIcon, Loader2 } from 'lucide-react';
import { BasicSearchSuggestions } from './BasicSearchSuggestions';
import { SmartSearchSuggestions } from './SmartSearchSuggestions';
import { CreatePropertyPin } from './CreatePropertyPin';

interface AddressSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  context: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

// Pin creation interface
interface PinCreationData {
  latitude: number;
  longitude: number;
  name: string;
  address: string; // Full address string
  searchType: 'basic' | 'smart'; // Which search type was used
  images: string[];
  notes?: string;
  searchHistoryId?: string;
}

// Separate state interfaces for clean separation
interface BasicSearchState {
  fullAddress: string;
  selectedSuggestion: BasicSearchSuggestion | null;
  suggestions: BasicSearchSuggestion[];
  isGeocoding: boolean;
}

interface SmartSearchState {
  addressFields: SmartSearchAddress;
  selectedSuggestion: SmartSearchSuggestion | null;
  suggestions: SmartSearchSuggestion[];
  isGeocoding: boolean;
  activeField: keyof SmartSearchAddress | null;
  preventFieldOverwrite: boolean;
}

interface SearchState {
  // Core state
  searchType: 'basic' | 'smart';
  
  // Separate search states
  basicSearch: BasicSearchState;
  smartSearch: SmartSearchState;
  
  // UI state
  ui: {
    isLoading: boolean;
    showPinCreation: boolean;
  };
  
  // Data state
  data: {
    credits: { availableCredits: number } | null;
    lastSearchResult: any | null;
    pinCreationData: PinCreationData | null;
  };
  
  // Messages
  messages: {
    error: string | null;
    success: string | null;
  };
}

// Clean initial state with separate search systems
const createInitialState = (): SearchState => ({
  searchType: 'basic',
  basicSearch: {
    fullAddress: '',
  selectedSuggestion: null,
    suggestions: [],
    isGeocoding: false,
  },
  smartSearch: {
  addressFields: {
    houseNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  },
    selectedSuggestion: null,
    suggestions: [],
    isGeocoding: false,
    activeField: null,
    preventFieldOverwrite: false,
  },
  ui: {
    isLoading: false,
    showPinCreation: false,
  },
  data: {
    credits: null,
    lastSearchResult: null,
    pinCreationData: null,
  },
  messages: {
    error: null,
    success: null,
  },
});

interface SmartSearchProps {
  onPinCreated?: () => void;
}

export function SmartSearch({ onPinCreated }: SmartSearchProps) {
  const [state, setState] = useState<SearchState>(createInitialState);
  
  const houseNumberInputRef = useRef<HTMLInputElement>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const stateInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Address parsing tests removed - functionality is working

  // Memoized computed values
  const hasCompleteAddress = useMemo(() => {
    if (state.searchType === 'basic') {
      // For basic search, we only need a selected suggestion
      return !!state.basicSearch.selectedSuggestion;
    } else {
      // For smart search, we need all individual fields filled
      const { houseNumber, street, city, state: stateField, zipCode } = state.smartSearch.addressFields;
    return houseNumber.trim() && street.trim() && city.trim() && stateField.trim() && zipCode.trim();
    }
  }, [state.smartSearch.addressFields, state.searchType, state.basicSearch.selectedSuggestion]);

  const canPerformSmartSearch = useMemo(() => {
    return hasCompleteAddress && 
           state.data.credits && 
           state.data.credits.availableCredits >= 1;
  }, [hasCompleteAddress, state.data.credits]);

  const canSearch = useMemo(() => {
    if (state.searchType === 'basic') {
      // For basic search, we only need a selected suggestion
      return !!state.basicSearch.selectedSuggestion;
    } else {
      // For smart search, we need complete address and credits
      return hasCompleteAddress && canPerformSmartSearch;
    }
  }, [hasCompleteAddress, state.searchType, canPerformSmartSearch, state.basicSearch.selectedSuggestion]);

  const currentSearchType = useMemo(() => {
    return canPerformSmartSearch ? state.searchType : 'basic';
  }, [canPerformSmartSearch, state.searchType]);

  // Optimized state updates
  const updateState = useCallback((updates: Partial<SearchState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUI = useCallback((uiUpdates: Partial<SearchState['ui']>) => {
    setState(prev => ({ 
      ...prev, 
      ui: { ...prev.ui, ...uiUpdates } 
    }));
  }, []);

  const updateData = useCallback((dataUpdates: Partial<SearchState['data']>) => {
    setState(prev => ({ 
      ...prev, 
      data: { ...prev.data, ...dataUpdates } 
    }));
  }, []);

  const updateMessages = useCallback((messageUpdates: Partial<SearchState['messages']>) => {
    setState(prev => ({ 
      ...prev, 
      messages: { ...prev.messages, ...messageUpdates } 
    }));
  }, []);

  const updateBasicSearch = useCallback((basicUpdates: Partial<BasicSearchState>) => {
    setState(prev => ({
      ...prev,
      basicSearch: { ...prev.basicSearch, ...basicUpdates }
    }));
  }, []);

  const updateSmartSearch = useCallback((smartUpdates: Partial<SmartSearchState>) => {
    setState(prev => ({
      ...prev,
      smartSearch: { ...prev.smartSearch, ...smartUpdates }
    }));
  }, []);

  const updateSmartAddressFields = useCallback((fieldUpdates: Partial<SmartSearchState['addressFields']>) => {
    setState(prev => ({
      ...prev,
      smartSearch: {
        ...prev.smartSearch,
        addressFields: { ...prev.smartSearch.addressFields, ...fieldUpdates }
      }
    }));
  }, []);

  const clearMessages = useCallback(() => {
    updateMessages({ error: null, success: null });
  }, [updateMessages]);



  const clearBasicSearch = useCallback(() => {
    updateBasicSearch({
      fullAddress: '',
      selectedSuggestion: null,
      suggestions: [],
      isGeocoding: false,
    });
  }, [updateBasicSearch]);

  const clearSmartSearch = useCallback(() => {
    updateSmartSearch({
      addressFields: {
      houseNumber: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      },
      selectedSuggestion: null,
      suggestions: [],
      isGeocoding: false,
      activeField: null,
      preventFieldOverwrite: false,
    });
  }, [updateSmartSearch]);

  const clearAddressFields = useCallback(() => {
    clearBasicSearch();
    clearSmartSearch();
  }, [clearBasicSearch, clearSmartSearch]);

  useEffect(() => {
    loadCredits();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        // Hide suggestions for both search types
        updateBasicSearch({ suggestions: [] });
        updateSmartSearch({ suggestions: [] });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [updateBasicSearch, updateSmartSearch]);

  const loadCredits = async () => {
    const credits = await PropertySearchService.getCreditBalance();
    updateData({ credits });
  };

  // Basic Search: Geocoding for full address
  const debouncedBasicGeocode = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        updateBasicSearch({ suggestions: [], isGeocoding: false });
        return;
      }

      updateBasicSearch({ isGeocoding: true });

      try {
        const suggestions = await BasicSearchService.geocodeAddress(query);
        updateBasicSearch({ 
          suggestions: BasicSearchService.enhanceSuggestions(suggestions), 
          isGeocoding: false 
        });
      } catch (error) {
        console.error('Basic search geocoding error:', error);
        updateBasicSearch({ isGeocoding: false });
      }
    }, 300),
    [updateBasicSearch]
  );

  // Smart Search: Context-aware geocoding for individual fields
  const debouncedSmartGeocode = useCallback(
    debounce(async (query: string, field: keyof SmartSearchAddress) => {
      if (!query.trim() || query.length < 2) {
        updateSmartSearch({ suggestions: [], isGeocoding: false });
        return;
      }

      updateSmartSearch({ isGeocoding: true });

      try {
        const suggestions = await SmartSearchService.geocodeWithContext(
          query, 
          field, 
          state.smartSearch.addressFields
        );
        updateSmartSearch({ suggestions, isGeocoding: false });
      } catch (error) {
        console.error('Smart search geocoding error:', error);
        updateSmartSearch({ isGeocoding: false });
      }
    }, 300),
    [updateSmartSearch, state.smartSearch.addressFields]
  );

  // Basic Search: Handle full address input
  const handleBasicAddressChange = (value: string) => {
    console.log(`📝 Basic address input: "${value}"`);
    updateBasicSearch({ 
      fullAddress: value,
      selectedSuggestion: null,
      suggestions: []
    });
    clearMessages();
    
    // Only geocode if we have a meaningful query
    if (value.trim() && value.length >= 2) {
      debouncedBasicGeocode(value);
    }
  };

  // Smart Search: Handle individual field changes
  const handleSmartFieldChange = (field: keyof SmartSearchState['addressFields'], value: string) => {
    // Don't update fields if we're preventing overwrites (e.g., after suggestion selection)
    if (state.smartSearch.preventFieldOverwrite) {
      console.log('🛡️ Field update blocked - suggestion recently selected');
      return;
    }
    
    console.log(`📝 Updating smart search ${field}: "${value}"`);
    updateSmartAddressFields({ [field]: value });
    updateSmartSearch({ selectedSuggestion: null });
    clearMessages();
    
    // Only geocode if we have a meaningful query
    if (value.trim() && value.length >= 2) {
      debouncedSmartGeocode(value, field);
    } else {
      updateSmartSearch({ suggestions: [] });
    }
  };

  // Basic Search: Handle suggestion selection
  const handleBasicSuggestionSelect = async (suggestion: BasicSearchSuggestion) => {
    try {
      console.log('Selected basic search suggestion:', suggestion.place_name);
      
      // Autofill the basic input with the selected address
      updateBasicSearch({ 
        fullAddress: suggestion.place_name,
        selectedSuggestion: suggestion,
        suggestions: []
      });
      
    } catch (error) {
      console.error('Error processing basic search suggestion:', error);
      updateMessages({ error: 'Failed to process address selection' });
    }
  };

  // Smart Search: Handle suggestion selection
  const handleSmartSuggestionSelect = async (suggestion: SmartSearchSuggestion) => {
    try {
      console.log('Selected smart search suggestion:', suggestion.place_name);
      
      // Use the SmartSearchService to parse the suggestion
      const parsedAddress = await SmartSearchService.parseAddressSuggestion(suggestion);
      
      console.log('Parsed address components:', parsedAddress);
      
      updateSmartAddressFields({
        houseNumber: parsedAddress.houseNumber,
        street: parsedAddress.street,
        city: parsedAddress.city,
        state: parsedAddress.state,
        zipCode: parsedAddress.zipCode,
      });
      
      updateSmartSearch({ 
        selectedSuggestion: suggestion,
        suggestions: [],
        preventFieldOverwrite: true // Prevent field overwrites
      });
      
      // Clear the prevent overwrite flag after a delay to allow manual edits
      setTimeout(() => {
        updateSmartSearch({ preventFieldOverwrite: false });
        console.log('✅ Field editing re-enabled');
      }, 2000); // 2 second delay
    } catch (error) {
      console.error('Error parsing smart search suggestion:', error);
      updateMessages({ error: 'Failed to process address selection' });
    }
  };

  // Map interaction only on search commit
  const handleMapInteraction = useCallback((suggestion: AddressSuggestion) => {
    if (window.flyToLocation) {
      const [lng, lat] = suggestion.center;
      window.flyToLocation(lat, lng, 15);

      if (window.dropPin) {
      window.dropPin(lat, lng, suggestion.place_name);
    }
    }
  }, []);

  // Search success handler
  const handleSearchSuccess = useCallback((searchResult: any) => {
    console.log('🔍 Search completed successfully:', searchResult);
    
    // Store the search result
    updateData({ lastSearchResult: searchResult });
    
    // CRITICAL FIX: Extract search history ID with fallback logic
    const searchHistoryId = searchResult.data?.searchHistoryId || 
                           searchResult.searchHistoryId || 
                           null;
    
    if (!searchHistoryId) {
      console.warn('⚠️ No search history ID returned from search service');
    } else {
      console.log('✅ Search history ID captured:', searchHistoryId);
    }
    
    // Determine the address and name based on search type
    let address = '';
    let defaultName = '';
    
    if (state.searchType === 'basic') {
      // Basic search: Use the full address from input
      address = state.basicSearch.fullAddress;
      defaultName = `Property at ${state.basicSearch.fullAddress.split(',')[0]}`; // Use first part of address
    } else {
      // Smart search: Construct full address from individual fields
      const { houseNumber, street, city, state: stateField, zipCode } = state.smartSearch.addressFields;
      address = `${houseNumber} ${street}, ${city}, ${stateField} ${zipCode}`;
      defaultName = `${houseNumber} ${street}`; // Use house number + street as default name
    }
    
    // CRITICAL FIX: Get coordinates from the selected suggestion, not from search result
    const selectedSuggestion = state.searchType === 'basic' 
      ? state.basicSearch.selectedSuggestion 
      : state.smartSearch.selectedSuggestion;
    
    if (!selectedSuggestion?.center) {
      console.error('❌ No coordinates available for pin creation');
      updateMessages({ error: 'Unable to create pin: coordinates not available' });
      updateUI({ isLoading: false });
        return;
      }

    const [lng, lat] = selectedSuggestion.center;
    
    // Prepare pin creation data with comprehensive address information
    updateData({ 
      pinCreationData: {
        latitude: lat,  // Use validated coordinates from suggestion
        longitude: lng, // Use validated coordinates from suggestion
        name: defaultName,
        address: address,
        searchType: state.searchType,
        images: [],
        notes: '',
        searchHistoryId: searchHistoryId
      }
    });
    
    console.log('✅ Pin creation data prepared:', {
      lat, lng, address, searchHistoryId, searchType: state.searchType
    });
    
    updateUI({ 
      showPinCreation: true,
      isLoading: false 
    });
    
    clearMessages();
  }, [updateData, updateUI, clearMessages, state.searchType, state.basicSearch.fullAddress, state.smartSearch.addressFields, state.basicSearch.selectedSuggestion, state.smartSearch.selectedSuggestion]);

  const handleSearch = async () => {
    if (!canSearch) {
      updateMessages({ error: 'Please complete the address information' });
      return;
    }

    // Get the selected suggestion for the current search type
    const selectedSuggestion = state.searchType === 'basic' 
      ? state.basicSearch.selectedSuggestion 
      : state.smartSearch.selectedSuggestion;
    
    // CRITICAL FIX: Validate coordinates before proceeding
    if (!selectedSuggestion?.center || 
        selectedSuggestion.center[0] === 0 || 
        selectedSuggestion.center[1] === 0) {
      updateMessages({ error: 'Please select a valid address suggestion before searching' });
      return;
    }

    // Validate coordinate ranges
    const [lng, lat] = selectedSuggestion.center;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      updateMessages({ error: 'Invalid coordinates detected. Please try selecting the address again.' });
        return;
      }

    console.log('✅ Valid coordinates detected:', { lat, lng, address: selectedSuggestion.place_name });
    
    // Use it for map interaction
    handleMapInteraction(selectedSuggestion);
    
    if (state.searchType === 'basic') {
      await performBasicSearch();
    } else {
      await performSmartSearch();
    }
  };

  const performBasicSearch = async () => {
    updateUI({ isLoading: true });
    clearMessages();
    
    try {
      const fullAddress = state.basicSearch.fullAddress;
      
      // CRITICAL FIX: Ensure we have valid coordinates from the validated suggestion
      if (!state.basicSearch.selectedSuggestion?.center) {
        throw new Error('No valid coordinates available for basic search');
      }
      
      // Mapbox returns [lng, lat] - ensure correct order for database
      const [lng, lat] = state.basicSearch.selectedSuggestion.center;
      const coordinates: [number, number] = [lng, lat];
      
      console.log('🔍 Basic search coordinates:', { lng, lat, address: fullAddress });
      
      const searchResult = await BasicSearchService.performSearch(fullAddress, coordinates);
      
      if (searchResult.success && searchResult.data) {
        handleSearchSuccess({
          success: true,
          data: searchResult.data,
          searchHistoryId: searchResult.data.searchHistoryId
        });
      } else {
        updateMessages({ error: searchResult.error || 'Basic search failed' });
        updateUI({ isLoading: false });
      }
      
    } catch (error) {
      console.error('Basic search error:', error);
      updateMessages({ error: 'Basic search failed' });
      updateUI({ isLoading: false });
    }
  };

  const performSmartSearch = async () => {
    updateUI({ isLoading: true });
    clearMessages();
    
    try {
      // CRITICAL FIX: Ensure we have valid coordinates from the validated suggestion
      if (!state.smartSearch.selectedSuggestion?.center) {
        throw new Error('No valid coordinates available for smart search');
      }
      
      // Mapbox returns [lng, lat] - ensure correct order for database
      const [lng, lat] = state.smartSearch.selectedSuggestion.center;
      const coordinates: [number, number] = [lng, lat];
      
      console.log('🔍 Smart search coordinates:', { lng, lat, address: state.smartSearch.addressFields });
      
      const searchResult = await SmartSearchService.performSearch(
        state.smartSearch.addressFields, 
        coordinates
      );
      
      if (searchResult.success && searchResult.data) {
        handleSearchSuccess({
          success: true,
          data: searchResult.data,
          searchHistoryId: searchResult.data.searchHistoryId
        });
        await loadCredits();
      } else {
        updateMessages({ error: searchResult.error || 'Smart search failed' });
        updateUI({ isLoading: false });
      }
      
    } catch (error) {
      console.error('Smart search error:', error);
      updateMessages({ error: 'Smart search failed' });
      updateUI({ isLoading: false });
    }
  };



  // Pin creation handlers
  const handlePinNameChange = useCallback((name: string) => {
    if (state.data.pinCreationData) {
      updateData({
        pinCreationData: { ...state.data.pinCreationData, name }
      });
    }
  }, [state.data.pinCreationData, updateData]);

  const handlePinNotesChange = useCallback((notes: string) => {
    if (state.data.pinCreationData) {
      updateData({
        pinCreationData: { ...state.data.pinCreationData, notes }
      });
    }
  }, [state.data.pinCreationData, updateData]);

  const handlePinImagesChange = useCallback((images: string[]) => {
    if (state.data.pinCreationData) {
      updateData({
        pinCreationData: { ...state.data.pinCreationData, images }
      });
    }
  }, [state.data.pinCreationData, updateData]);

  const handleCreatePin = async () => {
    if (!state.data.pinCreationData) return;
    
    try {
      // CRITICAL FIX: Validate pin creation data before sending to service
      const { latitude, longitude, name, searchHistoryId } = state.data.pinCreationData;
      
      // Validate coordinates
      if (!latitude || !longitude || latitude === 0 || longitude === 0) {
        updateMessages({ error: 'Invalid coordinates for pin creation. Please try searching again.' });
        return;
      }
      
      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        updateMessages({ error: 'Coordinates out of valid range. Please try searching again.' });
        return;
      }
      
      // Validate name
      if (!name || name.trim().length === 0) {
        updateMessages({ error: 'Pin name is required. Please enter a name for the property.' });
        return;
      }
      
      console.log('✅ Pin creation data validated:', {
        latitude, longitude, name, searchHistoryId,
        searchType: state.data.pinCreationData.searchType
      });
      
      // Show loading state
      updateUI({ isLoading: true });
      clearMessages();
      
      console.log('Creating pin with validated data:', state.data.pinCreationData);
      
      // Actually create the pin using the service
      const result = await PinsService.createPin({
        latitude: latitude,
        longitude: longitude,
        name: name.trim(),
        images: state.data.pinCreationData.images || [],
        notes: state.data.pinCreationData.notes || '',
        searchHistoryId: searchHistoryId
      });
      
      if (result.success && result.pin) {
        console.log('✅ Pin created successfully:', result.pin);
        
        // Show real success message
        updateMessages({ success: `Pin created successfully! ID: ${result.pin.id}` });
        
        // Wait a moment for user to see success, then reset
        setTimeout(() => {
          updateUI({ showPinCreation: false, isLoading: false });
          
          // Reset search state
          clearAddressFields();
          updateData({
            lastSearchResult: null,
            pinCreationData: null,
          });
          
          // Notify parent component that a pin was created
          if (onPinCreated) {
            onPinCreated();
          }
        }, 2000);
        
      } else {
        // Show real error message
        console.error('❌ Pin creation failed:', result.error);
        updateMessages({ error: result.error || 'Failed to create pin' });
        updateUI({ isLoading: false });
      }
      
    } catch (error) {
      console.error('Unexpected error creating pin:', error);
      updateMessages({ error: 'An unexpected error occurred while creating the pin' });
      updateUI({ isLoading: false });
    }
  };

  const handleSearchTypeChange = useCallback((newType: 'basic' | 'smart') => {
    updateState({ searchType: newType });
    // Clear suggestions when switching search types
    updateBasicSearch({ suggestions: [] });
    updateSmartSearch({ suggestions: [] });
    
    console.log(`🔄 Search type changed to: ${newType}`);
  }, [updateState, updateBasicSearch, updateSmartSearch]);

  // DEBUG: Log current state for troubleshooting
  const logCurrentState = useCallback(() => {
    console.log('🔍 Current SmartSearch State:', {
      searchType: state.searchType,
      basicSearch: {
        fullAddress: state.basicSearch.fullAddress,
        hasSuggestion: !!state.basicSearch.selectedSuggestion,
        coordinates: state.basicSearch.selectedSuggestion?.center
      },
      smartSearch: {
        addressFields: state.smartSearch.addressFields,
        hasSuggestion: !!state.smartSearch.selectedSuggestion,
        coordinates: state.smartSearch.selectedSuggestion?.center
      },
      pinCreationData: state.data.pinCreationData ? {
        latitude: state.data.pinCreationData.latitude,
        longitude: state.data.pinCreationData.longitude,
        searchHistoryId: state.data.pinCreationData.searchHistoryId,
        searchType: state.data.pinCreationData.searchType
      } : null
    });
  }, [state]);

  // Reset to search mode
  const handleBackToSearch = useCallback(() => {
    updateUI({ showPinCreation: false });
    updateData({
      lastSearchResult: null,
      pinCreationData: null,
    });
  }, [updateUI, updateData]);

  // If showing pin creation, render that instead
  if (state.ui.showPinCreation && state.data.pinCreationData) {
    return (
      <CreatePropertyPin
        pinData={state.data.pinCreationData}
        onBack={handleBackToSearch}
        onCreate={handleCreatePin}
        onNameChange={handlePinNameChange}
        onImagesChange={handlePinImagesChange}
        onNotesChange={handlePinNotesChange}
        isLoading={state.ui.isLoading}
      />
    );
  }

  // Main search interface
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-gray-200">
      <CardHeader className="pb-3">
        {/* Header content removed - title and credits moved */}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error/Success Messages */}
        {state.messages.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700 text-sm text-center">{state.messages.error}</div>
          </div>
        )}
        
        {state.messages.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-700 text-sm text-center">{state.messages.success}</div>
          </div>
        )}
        
        {/* Search Type Toggle - Minimalist Design */}
        <div className="flex items-center justify-center">
          <div className="bg-gray-100 rounded-full p-1">
            <button
              onClick={() => handleSearchTypeChange('basic')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                state.searchType === 'basic'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => handleSearchTypeChange('smart')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                state.searchType === 'smart'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Smart
            </button>
          </div>
        </div>

        {/* Address Input Fields */}
        <div className="space-y-3">
          {state.searchType === 'smart' ? (
            /* Smart Search: Individual Fields */
            <>
          {/* House Number and Street Address */}
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <Input
                ref={houseNumberInputRef}
                placeholder="House #"
                    value={state.smartSearch.addressFields.houseNumber}
                    onChange={(e) => handleSmartFieldChange('houseNumber', e.target.value)}
                    onFocus={() => updateSmartSearch({ activeField: 'houseNumber' })}
                    className="h-10 text-sm text-center border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
            </div>
            <div className="relative col-span-2">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={streetInputRef}
                placeholder="Street Address"
                value={state.smartSearch.addressFields.street}
                onChange={(e) => handleSmartFieldChange('street', e.target.value)}
                onFocus={() => updateSmartSearch({ activeField: 'street' })}
                className="pl-10 h-10 text-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
                  
            </div>
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                ref={cityInputRef}
                placeholder="City"
                    value={state.smartSearch.addressFields.city}
                    onChange={(e) => handleSmartFieldChange('city', e.target.value)}
                    onFocus={() => updateSmartSearch({ activeField: 'city' })}
                    className="h-10 text-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
            </div>
            <div className="relative">
              <Input
                ref={stateInputRef}
                placeholder="State"
                    value={state.smartSearch.addressFields.state}
                    onChange={(e) => handleSmartFieldChange('state', e.target.value)}
                    onFocus={() => updateSmartSearch({ activeField: 'state' })}
                    className="h-10 text-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
            </div>
          </div>

          {/* ZIP Code */}
          <div className="relative">
            <Input
              ref={zipInputRef}
              placeholder="ZIP Code"
              value={state.smartSearch.addressFields.zipCode}
              onChange={(e) => handleSmartFieldChange('zipCode', e.target.value)}
              onFocus={() => updateSmartSearch({ activeField: 'zipCode' })}
              className="h-10 text-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
                
              </div>
            </>
          ) : (
            /* Basic Search: Single Full Address Input */
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter full address (e.g., 123 Main St, City, State ZIP)"
                value={state.basicSearch.fullAddress}
                onChange={(e) => handleBasicAddressChange(e.target.value)}
                className="pl-10 h-10 text-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            )}
          </div>

        {/* Address Suggestions - Enhanced components for each search type */}
        {state.searchType === 'basic' && state.basicSearch.suggestions.length > 0 && (
          <BasicSearchSuggestions
            suggestions={state.basicSearch.suggestions}
            onSelect={handleBasicSuggestionSelect}
            isLoading={state.basicSearch.isGeocoding}
            searchQuery={state.basicSearch.fullAddress}
          />
        )}
        
        {state.searchType === 'smart' && state.smartSearch.suggestions.length > 0 && (
          <SmartSearchSuggestions
            suggestions={state.smartSearch.suggestions}
            onSelect={handleSmartSuggestionSelect}
            isLoading={state.smartSearch.isGeocoding}
            searchQuery={state.smartSearch.addressFields[state.smartSearch.activeField || 'street']}
            activeField={state.smartSearch.activeField || 'street'}
          />
        )}

        





        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={!canSearch || state.ui.isLoading}
          className="w-full h-10 text-sm font-medium"
        >
          {state.ui.isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <SearchIcon className="h-4 w-4 mr-2" />
              {state.searchType === 'smart' ? 'Smart Search' : 'Basic Search'}
            </>
          )}
        </Button>
        
        {/* Help Text and Credits Display removed */}


      </CardContent>
    </Card>
  );
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
