import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

/**
 * Shared Property API - Public access for shared property pages
 * This endpoint is designed for sharing property pages without authentication
 * It only returns public data and increments view count
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Shared Property API: Starting GET request for ID:', params.id);
    
    const pinId = params.id;
    
    // Use service role client for public access
    const supabase = createServerSupabaseClient();
    
    // Fetch the pin - only public pins should be accessible
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .select('*')
      .eq('id', pinId)
      .eq('is_public', true) // Only allow access to public pins
      .single();
    
    console.log('🔍 Shared Property API: Pin query result', { 
      pinId,
      hasPin: !!pin, 
      pinError: pinError?.message,
      pinErrorCode: pinError?.code
    });

    if (pinError || !pin) {
      console.log('❌ Shared Property API: Pin not found or not public', { 
        pinError: pinError?.message,
        pinErrorCode: pinError?.code
      });
      return NextResponse.json({ 
        error: 'Property not found or not publicly accessible',
        details: pinError?.message
      }, { status: 404 });
    }

    // Increment view count using the database RPC function (single source of truth)
    try {
      await supabase.rpc('increment_pin_view_count', { pin_id: pinId });
      console.log('✅ Shared Property API: View count incremented via RPC');
    } catch (viewError) {
      console.warn('⚠️ Shared Property API: Failed to increment view count:', viewError);
      // Don't fail the request if view tracking fails
    }

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
      console.warn('⚠️ Shared Property API: Error fetching for_sale listing:', listingError);
    }

    // Get fresh view count after incrementing
    const { data: updatedPin, error: fetchError } = await supabase
      .from('pins')
      .select('view_count, last_viewed_at')
      .eq('id', pinId)
      .single();

    // Check if visitor has agreed to terms (if required)
    let hasAgreedToTerms = false;
    if (pin.requires_terms_agreement) {
      const visitorIp = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       '127.0.0.1';
      
      try {
        const { data: agreementStatus } = await supabase
          .rpc('has_ip_agreed_to_terms', { 
            pin_id: pinId, 
            ip_address: visitorIp 
          });
        hasAgreedToTerms = agreementStatus || false;
      } catch (agreementError) {
        console.warn('⚠️ Shared Property API: Error checking terms agreement:', agreementError);
      }
    }

    // Prepare response data for public sharing
    const responseData = {
      pin: {
        id: pin.id,
        name: pin.name,
        title: pin.title,
        input_address: pin.input_address,
        latitude: pin.latitude,
        longitude: pin.longitude,
        notes: pin.notes,
        images: pin.images,
        created_at: pin.created_at,
        updated_at: pin.updated_at,
        // Remove sensitive fields
        user_id: undefined,
        search_history_id: undefined,
        is_public: pin.is_public,
        // Terms information
        requires_terms_agreement: pin.requires_terms_agreement || false,
        custom_terms: pin.requires_terms_agreement ? pin.custom_terms : undefined,
        terms_agreement_count: pin.terms_agreement_count || 0
      },
      forSaleListing: forSaleListing || null,
      viewCount: updatedPin?.view_count || pin.view_count || 0,
      lastViewed: updatedPin?.last_viewed_at || pin.last_viewed_at,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/property/${pinId}`,
      // Terms agreement status
      hasAgreedToTerms,
      requiresTermsAgreement: pin.requires_terms_agreement || false
    };

    console.log('✅ Shared Property API: Successfully returning shared property data');
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Shared Property API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
