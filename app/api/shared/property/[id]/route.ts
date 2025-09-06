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
    const pinId = params.id;
    
    // Use service role client for public access (this is appropriate for public endpoints)
    const supabase = createServerSupabaseClient();
    
    // Fetch the pin - only public pins should be accessible
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .select('*')
      .eq('id', pinId)
      .eq('is_public', true) // Only allow access to public pins
      .single();

    if (pinError || !pin) {
      return NextResponse.json({ 
        error: 'Property not found or not publicly accessible'
      }, { status: 404 });
    }

    // Increment view count using the database RPC function (single source of truth)
    try {
      await supabase.rpc('increment_pin_view_count', { pin_id: pinId });
    } catch (viewError) {
      // Don't fail the request if view tracking fails
    }

    // Note: for_sale table no longer exists, removed for_sale listing query

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
        // Don't fail the request if terms checking fails
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
        account_id: undefined,
        search_history_id: undefined,
        is_public: pin.is_public,
        // Terms information
        requires_terms_agreement: pin.requires_terms_agreement || false,
        custom_terms: pin.requires_terms_agreement ? pin.custom_terms : undefined,
        terms_agreement_count: pin.terms_agreement_count || 0
      },
      viewCount: updatedPin?.view_count || pin.view_count || 0,
      lastViewed: updatedPin?.last_viewed_at || pin.last_viewed_at,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/property/${pinId}`,
      // Terms agreement status
      hasAgreedToTerms,
      requiresTermsAgreement: pin.requires_terms_agreement || false
    };

    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
