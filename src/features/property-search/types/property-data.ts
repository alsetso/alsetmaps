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
