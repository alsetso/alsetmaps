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

    // Note: for_sale table no longer exists, removed for_sale listing query

    // Prepare response data
    const responseData = {
      pin: {
        ...pin,
        // Remove sensitive fields for public access
        user_id: undefined,
        search_history_id: undefined
      },
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

    // Note: for_sale table no longer exists, removed listing check

    // Create inquiry record (you'll need to create an inquiries table)
    // For now, we'll just log the inquiry
    console.log('📧 Public inquiry received:', {
      pinId,
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
