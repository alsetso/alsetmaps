import { createServerSupabaseClient } from '@/integrations/supabase/server-client'
import { PropertyMetadataConfig } from './metadata'

export interface PropertyData {
  id: string
  latitude: number
  longitude: number
  search_history?: {
    search_address: string
    search_type: string
    created_at: string
  }[]
  for_sale_listings?: {
    listing_price: number
    property_type: string
    title: string
    description: string
    bedrooms?: number
    bathrooms?: number
    square_footage?: number
    estimated_value?: number
    created_at: string
  }[]
  is_public: boolean
  created_at: string
}

/**
 * Fetch property data for metadata generation
 */
export async function fetchPropertyData(propertyId: string): Promise<PropertyData | null> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: property, error } = await supabase
      .from('pins')
      .select(`
        id,
        latitude,
        longitude,
        is_public,
        created_at,
        search_history (
          search_address,
          search_type,
          created_at
        ),
        for_sale_listings (
          listing_price,
          property_type,
          title,
          description,
          bedrooms,
          bathrooms,
          square_footage,
          estimated_value,
          created_at
        )
      `)
      .eq('id', propertyId)
      .single()

    if (error || !property) {
      console.error('Error fetching property data:', error)
      return null
    }

    return property as PropertyData
  } catch (error) {
    console.error('Error in fetchPropertyData:', error)
    return null
  }
}

/**
 * Convert property data to metadata configuration
 */
export function propertyDataToMetadataConfig(propertyData: PropertyData): PropertyMetadataConfig {
  const { search_history, for_sale_listings } = propertyData
  
  // Get the most recent listing
  const latestListing = for_sale_listings?.[0]
  
  // Extract address from search history
  const address = search_history?.[0]?.search_address || 'Property'
  
  return {
    propertyId: propertyData.id,
    propertyAddress: address,
    propertyType: latestListing?.property_type,
    listingPrice: latestListing?.listing_price,
    bedrooms: latestListing?.bedrooms,
    bathrooms: latestListing?.bathrooms,
    squareFootage: latestListing?.square_footage,
    estimatedValue: latestListing?.estimated_value,
    title: latestListing?.title || `Property at ${address}`,
    description: latestListing?.description || `View property details for ${address}`,
    keywords: [
      'real estate',
      'property listing',
      'home for sale',
      'property details',
      'market analysis',
      'investment property',
      latestListing?.property_type,
      address.split(',')[0], // City name
    ].filter(Boolean),
    url: `/property/${propertyData.id}`,
  }
}

/**
 * Fetch property data for shared property pages
 */
export async function fetchSharedPropertyData(propertyId: string): Promise<PropertyData | null> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: property, error } = await supabase
      .from('pins')
      .select(`
        id,
        latitude,
        longitude,
        is_public,
        created_at,
        search_history (
          search_address,
          search_type,
          created_at
        ),
        for_sale_listings (
          listing_price,
          property_type,
          title,
          description,
          bedrooms,
          bathrooms,
          square_footage,
          estimated_value,
          created_at
        )
      `)
      .eq('id', propertyId)
      .eq('is_public', true) // Only fetch public properties for shared pages
      .single()

    if (error || !property) {
      console.error('Error fetching shared property data:', error)
      return null
    }

    return property as PropertyData
  } catch (error) {
    console.error('Error in fetchSharedPropertyData:', error)
    return null
  }
}

/**
 * Convert shared property data to metadata configuration
 */
export function sharedPropertyDataToMetadataConfig(propertyData: PropertyData): PropertyMetadataConfig {
  const { search_history, for_sale_listings } = propertyData
  
  // Get the most recent listing
  const latestListing = for_sale_listings?.[0]
  
  // Extract address from search history
  const address = search_history?.[0]?.search_address || 'Property'
  
  return {
    propertyId: propertyData.id,
    propertyAddress: address,
    propertyType: latestListing?.property_type,
    listingPrice: latestListing?.listing_price,
    bedrooms: latestListing?.bedrooms,
    bathrooms: latestListing?.bathrooms,
    squareFootage: latestListing?.square_footage,
    estimatedValue: latestListing?.estimated_value,
    title: latestListing?.title || `Shared Property at ${address}`,
    description: latestListing?.description || `View shared property details for ${address}`,
    keywords: [
      'shared property',
      'real estate',
      'property listing',
      'home for sale',
      'property details',
      'market analysis',
      'investment property',
      latestListing?.property_type,
      address.split(',')[0], // City name
    ].filter(Boolean),
    url: `/shared/property/${propertyData.id}`,
  }
}
