import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

/**
 * Terms Agreement API - Handle terms agreement submissions
 * This endpoint allows visitors to agree to custom terms before viewing property details
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Terms Agreement API: Starting POST request for ID:', params.id);
    
    const supabase = createServerSupabaseClient();
    const pinId = params.id;
    const body = await request.json();
    
    // Extract visitor information
    const { 
      name, 
      email, 
      termsText, 
      browserInfo = {}, 
      deviceInfo = {}, 
      locationInfo = {}, 
      dataRetentionConsent = false 
    } = body;
    
    // Validate required fields
    if (!name || !email || !termsText) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, termsText' 
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // Get comprehensive visitor metadata
    const visitorIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const referrerUrl = request.headers.get('referer') || '';
    const sessionId = request.headers.get('x-session-id') || 
                     `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get IP geolocation (you might want to use a service like ipapi.co or similar)
    const ipGeolocation = {
      ip: visitorIp,
      timestamp: new Date().toISOString(),
      // Add geolocation service integration here if needed
      country: null,
      region: null,
      city: null,
      timezone: null
    };
    
    // Verify the pin exists and requires terms agreement
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .select('id, custom_terms, requires_terms_agreement, is_public')
      .eq('id', pinId)
      .eq('is_public', true)
      .eq('requires_terms_agreement', true)
      .single();
    
    if (pinError || !pin) {
      console.log('❌ Terms Agreement API: Pin not found or does not require terms agreement', { 
        pinError: pinError?.message 
      });
      return NextResponse.json({ 
        error: 'Property not found or does not require terms agreement' 
      }, { status: 404 });
    }
    
    // Verify the terms text matches what's stored in the database
    if (pin.custom_terms !== termsText) {
      return NextResponse.json({ 
        error: 'Terms text mismatch - please refresh the page and try again' 
      }, { status: 400 });
    }
    
    // Check if this IP has already agreed to terms for this pin
    const { data: existingAgreement, error: checkError } = await supabase
      .rpc('has_ip_agreed_to_terms', { 
        pin_id: pinId, 
        ip_address: visitorIp 
      });
    
    if (checkError) {
      console.warn('⚠️ Terms Agreement API: Error checking existing agreement:', checkError);
    }
    
    // If IP has already agreed, return success without creating duplicate
    if (existingAgreement) {
      console.log('✅ Terms Agreement API: IP has already agreed to terms');
      return NextResponse.json({ 
        success: true, 
        message: 'Terms agreement already recorded',
        alreadyAgreed: true
      });
    }
    
    // Create the comprehensive terms agreement record using the database function
    const { data: agreementId, error: agreementError } = await supabase
      .rpc('create_terms_agreement', {
        p_pin_id: pinId,
        p_visitor_name: name.trim(),
        p_visitor_email: email.trim().toLowerCase(),
        p_visitor_ip_address: visitorIp,
        p_terms_text: termsText,
        p_user_agent: userAgent,
        p_browser_info: browserInfo,
        p_device_info: deviceInfo,
        p_location_info: locationInfo,
        p_referrer_url: referrerUrl,
        p_session_id: sessionId,
        p_ip_geolocation: ipGeolocation,
        p_data_retention_consent: dataRetentionConsent
      });
    
    if (agreementError) {
      console.error('❌ Terms Agreement API: Error creating agreement:', agreementError);
      return NextResponse.json({ 
        error: 'Failed to record terms agreement' 
      }, { status: 500 });
    }
    
    console.log('✅ Terms Agreement API: Successfully recorded terms agreement');
    return NextResponse.json({ 
      success: true, 
      message: 'Terms agreement recorded successfully',
      agreementId: agreementId
    });
    
  } catch (error) {
    console.error('❌ Terms Agreement API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Check if an IP has already agreed to terms for a pin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Terms Agreement API: Starting GET request for ID:', params.id);
    
    const supabase = createServerSupabaseClient();
    const pinId = params.id;
    
    // Get visitor IP address
    const visitorIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    // Check if this IP has already agreed to terms for this pin
    const { data: hasAgreed, error: checkError } = await supabase
      .rpc('has_ip_agreed_to_terms', { 
        pin_id: pinId, 
        ip_address: visitorIp 
      });
    
    if (checkError) {
      console.error('❌ Terms Agreement API: Error checking agreement status:', checkError);
      return NextResponse.json({ 
        error: 'Failed to check agreement status' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      hasAgreed: hasAgreed || false 
    });
    
  } catch (error) {
    console.error('❌ Terms Agreement API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
