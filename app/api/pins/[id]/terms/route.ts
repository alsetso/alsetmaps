import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

/**
 * Pin Terms Management API - For property owners to manage terms settings
 * PUT: Update terms settings
 * GET: Get terms analytics
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Pin Terms API: Starting PUT request for ID:', params.id);
    
    const supabase = createServerSupabaseClientFromRequest(request);
    const pinId = params.id;
    const body = await request.json();

    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the user's account ID (now using auth.users.id directly)
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Verify the pin belongs to the user
    const { data: existingPin, error: fetchError } = await supabase
      .from('pins')
      .select('id')
      .eq('id', pinId)
      .eq('account_id', accountData.id)
      .single();

    if (fetchError || !existingPin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Handle terms settings
    if (body.customTerms !== undefined) {
      updateData.custom_terms = body.customTerms;
    }
    if (body.requiresTermsAgreement !== undefined) {
      updateData.requires_terms_agreement = body.requiresTermsAgreement;
    }

    // Update the pin
    const { data: updatedPin, error: updateError } = await supabase
      .from('pins')
      .update(updateData)
      .eq('id', pinId)
      .eq('account_id', accountData.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Pin Terms API: Error updating pin:', updateError);
      return NextResponse.json({ error: 'Failed to update terms settings' }, { status: 500 });
    }

    console.log('✅ Pin Terms API: Successfully updated terms settings');
    return NextResponse.json({
      success: true,
      pin: {
        id: updatedPin.id,
        custom_terms: updatedPin.custom_terms,
        requires_terms_agreement: updatedPin.requires_terms_agreement,
        terms_agreement_count: updatedPin.terms_agreement_count
      }
    });

  } catch (error) {
    console.error('❌ Pin Terms API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get terms analytics for a pin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Pin Terms API: Starting GET request for analytics');
    
    const supabase = createServerSupabaseClientFromRequest(request);
    const pinId = params.id;

    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the user's account ID (now using auth.users.id directly)
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Get pin terms settings
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .select(`
        id,
        name,
        custom_terms,
        requires_terms_agreement,
        terms_agreement_count,
        created_at,
        updated_at
      `)
      .eq('id', pinId)
      .eq('account_id', accountData.id)
      .single();

    if (pinError || !pin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    // Get terms agreement analytics
    const { data: analytics, error: analyticsError } = await supabase
      .rpc('get_pin_terms_agreement_stats', { pin_id: pinId });

    if (analyticsError) {
      console.warn('⚠️ Pin Terms API: Error fetching analytics:', analyticsError);
    }

    // Get recent agreements (last 10)
    const { data: recentAgreements, error: agreementsError } = await supabase
      .from('terms_agreements')
      .select(`
        id,
        visitor_name,
        visitor_email,
        is_authenticated_user,
        account_id,
        agreed_at,
        browser_info,
        device_info,
        location_info
      `)
      .eq('pin_id', pinId)
      .order('agreed_at', { ascending: false })
      .limit(10);

    if (agreementsError) {
      console.warn('⚠️ Pin Terms API: Error fetching recent agreements:', agreementsError);
    }

    const response = {
      pin: {
        id: pin.id,
        name: pin.name,
        customTerms: pin.custom_terms,
        requiresTermsAgreement: pin.requires_terms_agreement,
        termsAgreementCount: pin.terms_agreement_count,
        createdAt: pin.created_at,
        updatedAt: pin.updated_at
      },
      analytics: analytics?.[0] || {
        total_agreements: 0,
        unique_emails: 0,
        unique_ips: 0,
        recent_agreements: 0
      },
      recentAgreements: recentAgreements || []
    };

    console.log('✅ Pin Terms API: Successfully returning terms analytics');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Pin Terms API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
