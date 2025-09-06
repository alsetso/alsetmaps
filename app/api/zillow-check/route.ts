import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

/**
 * Zillow Check API - Fetch property data and photos from Zillow via RapidAPI
 * POST: Get property data and photos for an address
 */

export async function POST(request: NextRequest) {
  try {
    // For now, let's make this API accessible without authentication
    // since it's just calling an external Zillow API
    // const supabase = createServerSupabaseClientFromRequest(request);
    
    // // Get the current authenticated user
    // const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    // }

    const body = await request.json();
    const { address } = body;

    console.log('Zillow Check API - Request received:', { address });

    if (!address) {
      return NextResponse.json({ 
        error: 'Address is required' 
      }, { status: 400 });
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY || 'f4a7d42741mshbc2b95a8fd24074p1cf1a6jsn44343abb32e8';
    console.log('Zillow Check API - Using RapidAPI key:', rapidApiKey ? 'Key present' : 'No key');

    // First API call: Search address to get zpid
    const searchUrl = `https://zillow56.p.rapidapi.com/search_address?address=${encodeURIComponent(address)}`;
    console.log('Zillow Check API - Search URL:', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'zillow56.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey
      }
    });

    if (!searchResponse.ok) {
      console.error('Zillow search API error:', searchResponse.status, searchResponse.statusText);
      return NextResponse.json({ 
        error: 'Failed to search address on Zillow API' 
      }, { status: 500 });
    }

    const searchData = await searchResponse.json();
    console.log('Zillow Check API - Search response:', searchData);
    
    // Extract zpid from search results
    const zpid = searchData.zpid;
    console.log('Zillow Check API - Extracted zpid:', zpid);
    
    if (!zpid) {
      return NextResponse.json({ 
        error: 'No property found for this address' 
      }, { status: 404 });
    }

    // Return only search data
    const responseData = {
      searchData,
      zpid
    };
    console.log('Zillow Check API - Final response:', responseData);
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching Zillow data:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
