import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

/**
 * API endpoint for managing pin sharing settings
 * PUT: Update sharing settings
 * GET: Get sharing analytics
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Pin Sharing API: Starting PUT request for ID:', params.id);
    
    const supabase = createServerSupabaseClientFromRequest(request);
    const pinId = params.id;
    const body = await request.json();

    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the user's account ID
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Verify the pin belongs to the user
    const { data: existingPin, error: fetchError } = await supabase
      .from('pins')
      .select('id')
      .eq('id', pinId)
      .eq('user_id', accountData.id)
      .single();

    if (fetchError || !existingPin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Handle different sharing settings
    if (body.isPublic !== undefined) {
      updateData.is_public = body.isPublic;
    }
    if (body.customDomain !== undefined) {
      updateData.custom_domain = body.customDomain;
    }
    if (body.seoTitle !== undefined) {
      updateData.seo_title = body.seoTitle;
    }
    if (body.seoDescription !== undefined) {
      updateData.seo_description = body.seoDescription;
    }
    if (body.shareSettings !== undefined) {
      updateData.share_settings = body.shareSettings;
    }

    // Update the pin
    const { data: updatedPin, error: updateError } = await supabase
      .from('pins')
      .update(updateData)
      .eq('id', pinId)
      .eq('user_id', accountData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating pin sharing settings:', updateError);
      return NextResponse.json({ error: 'Failed to update sharing settings' }, { status: 500 });
    }

    console.log('✅ Pin Sharing API: Successfully updated sharing settings');
    return NextResponse.json(updatedPin);

  } catch (error) {
    console.error('❌ Pin Sharing API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get sharing analytics for a pin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Pin Sharing API: Starting GET request for analytics');
    
    const supabase = createServerSupabaseClientFromRequest(request);
    const pinId = params.id;

    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the user's account ID
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Get pin sharing analytics
    const { data: pin, error } = await supabase
      .from('pins')
      .select(`
        id,
        name,
        is_public,
        share_token,
        view_count,
        last_viewed_at,
        seo_title,
        seo_description,
        share_settings,
        created_at,
        updated_at
      `)
      .eq('id', pinId)
      .eq('user_id', accountData.id)
      .single();

    if (error || !pin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/property/${pinId}`;

    const analytics = {
      pin: {
        id: pin.id,
        name: pin.name,
        isPublic: pin.is_public,
        shareToken: pin.share_token,
        viewCount: pin.view_count,
        lastViewed: pin.last_viewed_at,
        seoTitle: pin.seo_title,
        seoDescription: pin.seo_description,
        shareSettings: pin.share_settings,
        createdAt: pin.created_at,
        updatedAt: pin.updated_at
      },
      shareUrl,
      analytics: {
        totalViews: pin.view_count,
        lastViewed: pin.last_viewed_at,
        isPublic: pin.is_public,
        shareToken: pin.share_token
      }
    };

    console.log('✅ Pin Sharing API: Successfully returning analytics');
    return NextResponse.json(analytics);

  } catch (error) {
    console.error('❌ Pin Sharing API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
