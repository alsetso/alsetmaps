import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest, createServerSupabaseClient } from '@/integrations/supabase/server-client';

// Helper function to call the Zillow API with rate limiting and error handling
async function callZillowAPI(address: string): Promise<any> {
  try {
    console.log('Calling Zillow API for address:', address);
    
    // Build the URL with the address as a query parameter
    const url = new URL('https://zillow56.p.rapidapi.com/search_address');
    url.searchParams.append('address', address);
    
    // Get the API key from server-side environment variables
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY environment variable is not set');
    }
    
    console.log('Calling Zillow API with URL:', url.toString());
    
    // Call the Zillow API with proper headers
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'zillow56.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
        'User-Agent': 'AlsetMaps/1.0'
      }
    });

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }
      throw new Error(`Zillow API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Zillow API response received');

    // Check if the API returned an error
    if (data.error) {
      throw new Error(`Zillow API returned error: ${data.error}`);
    }

    return data;

  } catch (error) {
    console.error('Zillow API call failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

// Helper function to transform Zillow data to our PropertyData format
function transformZillowData(zillowData: any, address: string, latitude: number, longitude: number): PropertyData {
  // Extract property information from Zillow response
  const property = zillowData.property || zillowData;
  
  return {
    address: address,
    latitude: latitude,
    longitude: longitude,
    propertyType: property.propertyType || property.type || 'Unknown',
    squareFootage: property.squareFootage || property.livingArea || 0,
    bedrooms: property.bedrooms || property.beds || 0,
    bathrooms: property.bathrooms || property.baths || 0,
    yearBuilt: property.yearBuilt || property.year || 0,
    estimatedValue: property.estimatedValue || property.price || property.zestimate || 0,
    lastSoldDate: property.lastSoldDate || property.soldDate,
    lastSoldPrice: property.lastSoldPrice || property.soldPrice,
    propertyTax: property.propertyTax || property.tax || 0,
    lotSize: property.lotSize || property.lotArea || 0,
    neighborhood: property.neighborhood || property.area || 'Unknown',
    schoolDistrict: property.schoolDistrict || 'Unknown',
    crimeRate: property.crimeRate || 'Unknown',
    walkScore: property.walkScore || 0,
    transitScore: property.transitScore || 0,
    bikeScore: property.bikeScore || 0,
    nearbyAmenities: property.nearbyAmenities || [],
    marketTrends: {
      trend: property.marketTrend || 'stable',
      changePercent: property.priceChangePercent || 0,
      timeframe: property.priceChangeTimeframe || 'Unknown'
    },
    investmentPotential: {
      score: property.investmentScore || 5.0,
      factors: property.investmentFactors || ['Property data available']
    }
  };
}

interface SmartSearchRequest {
  latitude: number;
  longitude: number;
  address: string;
}

interface PropertyData {
  address: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  estimatedValue: number;
  lastSoldDate?: string;
  lastSoldPrice?: number;
  propertyTax: number;
  lotSize: number;
  neighborhood: string;
  schoolDistrict: string;
  crimeRate: string;
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  nearbyAmenities: string[];
  marketTrends: {
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
    timeframe: string;
  };
  investmentPotential: {
    score: number;
    factors: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate request method
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Create supabase client with request (same as accounts API)
    const supabase = createServerSupabaseClientFromRequest(request);

    // Debug: Log cookie headers
    const cookieHeader = request.headers.get('cookie');
    console.log('🔍 Smart search API - Cookie header:', cookieHeader);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔍 Smart search API - Auth result:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.log('🔍 Smart search API - Authentication failed:', authError);
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authError?.message || 'No user found',
        debug: { authError, user }
      }, { status: 401 });
    }

    // Get user's account data (id now equals auth user id)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', user.id)
      .single();

    console.log('🔍 Smart search API - Account lookup:', { account, error: accountError });

    if (accountError || !account) {
      console.log('🔍 Smart search API - Account not found:', accountError);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body: SmartSearchRequest = await request.json();
    const { latitude, longitude, address } = body;

    // Validate required fields
    if (!latitude || !longitude || !address) {
      return NextResponse.json(
        { error: 'Latitude, longitude, and address are required' },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Check if user has enough credits for smart search
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('available_credits')
      .eq('account_id', account.id)
      .single();

    if (creditsError || !credits || credits.available_credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits for smart search' },
        { status: 402 }
      );
    }

    console.log(`Smart search requested for: ${address} at ${latitude}, ${longitude}`);

    // Call the real Zillow API
    const zillowData = await callZillowAPI(address);
    
    if (zillowData.error) {
      return NextResponse.json(
        { 
          error: `Zillow API error: ${zillowData.error}`,
          details: 'Failed to fetch property data from Zillow'
        },
        { status: 500 }
      );
    }

    // Transform Zillow data to our PropertyData format
    const propertyData: PropertyData = transformZillowData(zillowData, address, latitude, longitude);

    // Record the search in search_history
    const { data: searchHistory, error: searchError } = await supabase
      .from('search_history')
      .insert({
        account_id: account.id,
        address: address,
        latitude: latitude,
        longitude: longitude,
        search_type: 'smart',
        credits_used: 1,
        smart_data: zillowData
      })
      .select()
      .single();

    if (searchError) {
      console.error('Error recording search history:', searchError);
      return NextResponse.json(
        { error: 'Failed to record search history' },
        { status: 500 }
      );
    }

    // Record credit transaction and deduct credits
    const { data: transactionId, error: transactionError } = await supabase
      .rpc('record_credit_usage', {
        p_auth_user_id: user.id, // Use user.id (auth user ID) directly
        p_amount: -1, // Negative for deduction
        p_description: `Smart search for ${address}`,
        p_reference_id: searchHistory.id,
        p_reference_table: 'search_history',
        p_metadata: {
          address: address,
          coordinates: { latitude, longitude },
          search_type: 'smart',
          api_source: 'zillow'
        }
      });

    if (transactionError) {
      console.error('Error recording credit transaction:', transactionError);
      // Don't fail the request, but log the error
    }

    console.log(`Smart search completed for: ${address}`);

    return NextResponse.json({
      success: true,
      data: propertyData,
      searchMetadata: {
        timestamp: new Date().toISOString(),
        coordinates: { latitude, longitude },
        searchType: 'smart',
        dataSource: 'zillow',
        searchHistoryId: searchHistory.id,
        creditsUsed: 1
      }
    });

  } catch (error) {
    console.error('Smart search API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Smart search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'Smart Search API is running',
    endpoints: {
      POST: '/api/pins/smart-search - Submit smart search request'
    },
    requiredFields: ['latitude', 'longitude', 'address']
  });
}
