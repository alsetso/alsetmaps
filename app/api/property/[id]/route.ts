import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

/**
 * Public Property API - No authentication required
 * This endpoint is designed for sharing property pages
 * It handles both public pins and owner access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Public Property API: Starting GET request for ID:', params.id);
    
    const pinId = params.id;
    
    // Use request-based client to get proper permissions
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // First, try to fetch the pin directly (backward compatible)
    console.log('🔍 Public Property API: Attempting to fetch pin with ID:', pinId);
    
    // Try a simple query first to test permissions
    const { data: allPins, error: testError } = await supabase
      .from('pins')
      .select('id, name')
      .limit(5);
    
    console.log('🔍 Public Property API: Test query result', { 
      testError: testError?.message,
      testErrorCode: testError?.code,
      pinsCount: allPins?.length
    });
    
    const { data: pins, error: pinError } = await supabase
      .from('pins')
      .select('*')
      .eq('id', pinId);
    
    const pin = pins && pins.length > 0 ? pins[0] : null;

    console.log('🔍 Public Property API: Pin query result', { 
      pinId,
      hasPin: !!pin, 
      pinError: pinError?.message,
      pinErrorCode: pinError?.code,
      pinErrorDetails: pinError?.details,
      pinErrorHint: pinError?.hint
    });

    if (pinError || !pin) {
      console.log('❌ Public Property API: Pin not found', { 
        pinError: pinError?.message,
        pinErrorCode: pinError?.code,
        pinErrorDetails: pinError?.details
      });
      return NextResponse.json({ 
        error: 'Property not found',
        details: pinError?.message,
        code: pinError?.code
      }, { status: 404 });
    }

    // BARE BONES: Allow access to anyone for now
    let hasAccess = true;
    let isOwner = false;
    let isPublic = true;

    console.log('✅ Public Property API: Bare bones access granted to everyone');

    // Check if this pin has a for_sale listing
    const { data: forSaleListing, error: listingError } = await supabase
      .from('for_sale')
      .select(`
        id,
        title,
        description,
        property_type,
        listing_price,
        timeline,
        for_sale_by,
        images,
        contact_info,
        agent_name,
        agent_company,
        agent_phone,
        agent_email,
        status,
        views_count,
        inquiries_count,
        created_at,
        updated_at
      `)
      .eq('pin_id', pinId)
      .eq('status', 'active')
      .single();

    if (listingError && listingError.code !== 'PGRST116') {
      console.warn('⚠️ Public Property API: Error fetching for_sale listing:', listingError);
    }

    // Prepare response data (backward compatible)
    const responseData = {
      pin: {
        ...pin,
        // Remove sensitive fields for non-owners
        ...(isOwner ? {} : { 
          user_id: undefined,
          search_history_id: undefined 
        })
      },
      forSaleListing: forSaleListing || null,
      isOwner,
      isPublic,
      viewCount: pin.view_count || 0, // Default to 0 if column doesn't exist
      lastViewed: pin.last_viewed_at || null, // Default to null if column doesn't exist
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/property/${pinId}`
    };

    console.log('✅ Public Property API: Successfully returning property data');
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Public Property API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
