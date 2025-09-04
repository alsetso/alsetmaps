export interface PropertyData {
  id: string;
  address_hash: string;
  latitude: number;
  longitude: number;
  total_searches: number;
  // Add other properties as needed
}

export interface PropertySearchResult {
  id: string;
  address_hash: string;
  coordinates: [number, number];
  // Add other properties as needed
}

export interface PinCreationData {
  latitude: number;
  longitude: number;
  name: string;
  address: string; // Full address string
  searchType: 'basic' | 'smart'; // Which search type was used
  images: string[];
  notes?: string;
  searchHistoryId?: string;
}
