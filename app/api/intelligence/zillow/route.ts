import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

/**
 * Zillow Intelligence API - Fetch property data from Zillow via RapidAPI
 * POST: Get property intelligence data for an address
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ 
        error: 'Address is required' 
      }, { status: 400 });
    }

    // Call Zillow API via RapidAPI
    const zillowResponse = await fetch(
      `https://zillow56.p.rapidapi.com/search_address?address=${encodeURIComponent(address)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'zillow56.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'f4a7d42741mshbc2b95a8fd24074p1cf1a6jsn44343abb32e8'
        }
      }
    );

    if (!zillowResponse.ok) {
      console.error('Zillow API error:', zillowResponse.status, zillowResponse.statusText);
      return NextResponse.json({ 
        error: 'Failed to fetch data from Zillow API' 
      }, { status: 500 });
    }

    const zillowData = await zillowResponse.json();

    // Transform the data to a more usable format
    const intelligenceData = {
      address: zillowData.address || address,
      zestimate: zillowData.zestimate ? parseInt(zillowData.zestimate.replace(/[^0-9]/g, '')) : null,
      rentZestimate: zillowData.rentZestimate ? parseInt(zillowData.rentZestimate.replace(/[^0-9]/g, '')) : null,
      lotSize: zillowData.lotSize || null,
      yearBuilt: zillowData.yearBuilt ? parseInt(zillowData.yearBuilt) : null,
      bedrooms: zillowData.bedrooms ? parseInt(zillowData.bedrooms) : null,
      bathrooms: zillowData.bathrooms ? parseFloat(zillowData.bathrooms) : null,
      squareFeet: zillowData.squareFeet ? parseInt(zillowData.squareFeet.replace(/[^0-9]/g, '')) : null,
      propertyType: zillowData.propertyType || null,
      lastSoldPrice: zillowData.lastSoldPrice ? parseInt(zillowData.lastSoldPrice.replace(/[^0-9]/g, '')) : null,
      lastSoldDate: zillowData.lastSoldDate || null,
      pricePerSqft: zillowData.pricePerSqft ? parseFloat(zillowData.pricePerSqft.replace(/[^0-9.]/g, '')) : null,
      taxAssessedValue: zillowData.taxAssessedValue ? parseInt(zillowData.taxAssessedValue.replace(/[^0-9]/g, '')) : null,
      taxAssessedYear: zillowData.taxAssessedYear ? parseInt(zillowData.taxAssessedYear) : null,
      rawData: zillowData // Include raw data for debugging
    };

    return NextResponse.json(intelligenceData);

  } catch (error) {
    console.error('Error fetching Zillow intelligence data:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

