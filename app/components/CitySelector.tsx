'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface City {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number | null;
}

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  state?: string; // Optional state filter
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function CitySelector({ 
  value, 
  onChange, 
  state, 
  required = false, 
  placeholder = "Select a city",
  className = ""
}: CitySelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch cities from database
  useEffect(() => {
    const fetchCities = async () => {
      try {
        let query = supabase
          .from('cities')
          .select('name, state, latitude, longitude, population')
          .order('name');

        // Filter by state if provided
        if (state) {
          query = query.eq('state', state);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching cities:', error);
          setCities([]);
        } else {
          setCities(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching cities:', error);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [state]);

  // Filter cities based on search term
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle city selection
  const handleCitySelect = (cityName: string) => {
    onChange(cityName);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle input change for search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // If user types a value that matches a city exactly, select it
    const exactMatch = cities.find(city => 
      city.name.toLowerCase() === newValue.toLowerCase()
    );
    if (exactMatch) {
      onChange(newValue);
    } else if (newValue === '') {
      onChange('');
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm(value);
  };

  // Handle input blur (with delay to allow click on dropdown)
  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  if (loading) {
    return (
      <div className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 ${className}`}>
        <span className="text-gray-500">Loading cities...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={isOpen ? searchTerm : value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        autoComplete="off"
      />
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCities.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {searchTerm ? 'No cities found' : 'No cities available'}
            </div>
          ) : (
            filteredCities.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleCitySelect(city.name)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{city.name}</span>
                  <span className="text-sm text-gray-500">{city.state}</span>
                </div>
                {city.population && (
                  <div className="text-xs text-gray-400">
                    Population: {city.population.toLocaleString()}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
