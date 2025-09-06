import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

/**
 * Public API endpoint for fetching all public pins
 * This endpoint allows public access to all pins marked as public
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 For-Sale Pins API: Starting GET request for all for-sale pins');
    
    const supabase = createServerSupabaseClient();

    // Fetch all for-sale pins
    const { data: pins, error: pinsError } = await supabase
      .from('pins')
      .select(`
        id,
        name,
        latitude,
        longitude,
        images,
        notes,
        is_public,
        share_token,
        view_count,
        last_viewed_at,
        seo_title,
        seo_description,
        share_settings,
        created_at,
        updated_at,
        is_for_sale,
        listing_price,
        property_type,
        listing_description,
        listing_status,
        for_sale_by,
        agent_name,
        agent_company,
        agent_phone,
        agent_email,
        bedrooms,
        bathrooms,
        square_feet,
        lot_size,
        year_built
      `)
      .eq('is_for_sale', true) // Only return for-sale pins
      .eq('listing_status', 'active') // Only active listings
      .order('created_at', { ascending: false });

    console.log('🔍 For-Sale Pins API: Pins query result', { 
      pinsCount: pins?.length || 0, 
      pinsError: pinsError?.message 
    });

    if (pinsError) {
      console.error('❌ For-Sale Pins API: Database error', { error: pinsError.message });
      return NextResponse.json({ 
        error: 'Failed to fetch for-sale pins' 
      }, { status: 500 });
    }

    // Prepare response data
    const responseData = {
      pins: pins || [],
      count: pins?.length || 0
    };

    console.log('✅ For-Sale Pins API: Successfully returning for-sale pins data:', {
      count: responseData.count
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ For-Sale Pins API: Unexpected error', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
