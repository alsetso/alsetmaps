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
    const supabase = createServerSupabaseClientFromRequest(request);
    const pinId = params.id;
    const body = await request.json();

    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
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

    // Update the pin - RLS policies will ensure user can only update their own pins
    const { data: updatedPin, error: updateError } = await supabase
      .from('pins')
      .update(updateData)
      .eq('id', pinId)
      .eq('account_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update sharing settings' }, { status: 500 });
    }

    if (!updatedPin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPin);

  } catch (error) {
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
    const supabase = createServerSupabaseClientFromRequest(request);
    const pinId = params.id;

    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get pin sharing analytics - RLS policies will ensure user can only access their own pins
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
      .eq('account_id', user.id)
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

    return NextResponse.json(analytics);

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
