import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

/**
 * Public API endpoint for accessing pin data without authentication
 * This endpoint allows public access to pins marked as public
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Public Pin API: Starting GET request for ID:', params.id);
    
    const supabase = createServerSupabaseClient();
    const pinId = params.id;

    // Fetch the pin data - only public pins are accessible
    const { data: pin, error: pinError } = await supabase
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
        search_history:search_history_id(
          id,
          search_address,
          search_type,
          search_tier,
          smart_data,
          created_at
        )
      `)
      .eq('id', pinId)
      .eq('is_public', true) // Only return public pins
      .single();

    console.log('🔍 Public Pin API: Pin query result', { 
      pinId, 
      hasPin: !!pin, 
      pinError: pinError?.message 
    });

    if (pinError || !pin) {
      console.log('❌ Public Pin API: Pin not found or not public', { pinError: pinError?.message });
      return NextResponse.json({ 
        error: 'Pin not found or not publicly accessible' 
      }, { status: 404 });
    }

    // Note: View count tracking is handled by /api/shared/property/[id] endpoint
    // This endpoint is for general public access without view tracking

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
      .eq('status', 'active') // Only show active listings
      .single();

    if (listingError && listingError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine - not all pins have listings
      console.warn('⚠️ Public Pin API: Error fetching for_sale listing:', listingError);
    }

    // Prepare response data
    const responseData = {
      pin: {
        ...pin,
        // Remove sensitive fields for public access
        user_id: undefined,
        search_history_id: undefined
      },
      forSaleListing: forSaleListing || null,
      isPublic: true,
      viewCount: pin.view_count,
      lastViewed: pin.last_viewed_at
    };

    console.log('✅ Public Pin API: Successfully returning public pin data:', pin.id);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Public Pin API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Handle public inquiries for pins with for_sale listings
 * This allows non-authenticated users to submit inquiries
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Public Pin API: Starting POST request for inquiry');
    
    const supabase = createServerSupabaseClient();
    const pinId = params.id;
    const body = await request.json();

    // Validate required fields for inquiry
    const { name, email, phone, message, inquiry_type = 'general' } = body;
    
    if (!name || !email || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, message' 
      }, { status: 400 });
    }

    // Verify the pin exists and is public
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .select('id, is_public')
      .eq('id', pinId)
      .eq('is_public', true)
      .single();

    if (pinError || !pin) {
      return NextResponse.json({ 
        error: 'Pin not found or not publicly accessible' 
      }, { status: 404 });
    }

    // Check if there's an active for_sale listing
    const { data: listing, error: listingError } = await supabase
      .from('for_sale')
      .select('id, user_id, title')
      .eq('pin_id', pinId)
      .eq('status', 'active')
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ 
        error: 'No active listing found for this property' 
      }, { status: 404 });
    }

    // Create inquiry record (you'll need to create an inquiries table)
    // For now, we'll just log the inquiry
    console.log('📧 Public inquiry received:', {
      pinId,
      listingId: listing.id,
      listingTitle: listing.title,
      inquiry: {
        name,
        email,
        phone,
        message,
        inquiry_type,
        timestamp: new Date().toISOString()
      }
    });

    // TODO: Create inquiries table and store the inquiry
    // TODO: Send notification email to listing owner
    // TODO: Send confirmation email to inquirer

    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry submitted successfully' 
    });

  } catch (error) {
    console.error('❌ Public Pin API: Error processing inquiry:', error);
    return NextResponse.json({ 
      error: 'Failed to submit inquiry' 
    }, { status: 500 });
  }
}
