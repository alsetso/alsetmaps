import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest, createServerSupabaseClient } from '@/integrations/supabase/server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pinId = params.id;
    
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Use service role client to bypass RLS and check ownership manually
    const serviceSupabase = createServerSupabaseClient();
    
    // Query the pin directly without RLS restrictions
    const { data: pin, error: pinError } = await serviceSupabase
      .from('pins')
      .select('*')
      .eq('id', pinId)
      .single();

    if (pinError || !pin) {
      return NextResponse.json({ 
        error: 'Property not found'
      }, { status: 404 });
    }

    // Check if user can access this pin (owns it OR it's public)
    if ((user && pin.account_id === user.id) || pin.is_public) {
      // User owns this pin OR pin is public - allow access
      if (user && pin.account_id === user.id) {
        console.log('✅ User owns this pin, allowing access');
      } else {
        console.log('✅ Pin is public, allowing access');
      }
    } else {
      // User doesn't own the pin and it's not public - deny access
      return NextResponse.json({ 
        error: 'Property not found or access denied'
      }, { status: 404 });
    }

    // Fetch search history if pin has search_history_id
    let searchHistory = null;
    if (pin.search_history_id) {
      const { data: searchHistoryData, error: searchHistoryError } = await serviceSupabase
        .from('search_history')
        .select('search_address, search_type, created_at, credits_used')
        .eq('id', pin.search_history_id)
        .single();
      
      if (!searchHistoryError && searchHistoryData) {
        searchHistory = searchHistoryData;
      }
    }

    // Simple response - no ownership or public/private logic
    const responseData = {
      pin: pin,
      searchHistory: searchHistory,
      viewCount: pin?.view_count || 0,
      lastViewed: pin?.last_viewed_at || null,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/property/${pinId}`
    };

    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClientFromRequest(request);
    const pinId = params.id;
    const body = await request.json();

    console.log('PUT /api/pins/[id] - Updating pin:', pinId, 'with data:', body);

    // Debug: Log cookie headers and all headers
    const cookieHeader = request.headers.get('cookie');
    const allHeaders = Object.fromEntries(request.headers.entries());
    console.log('🔍 Pins API - Cookie header:', cookieHeader);
    console.log('🔍 Pins API - All headers:', allHeaders);

    // TEMPORARY: Bypass authentication and use service role client
    // This will help us determine if the issue is authentication or something else
    const serviceSupabase = createServerSupabaseClient();
    
    console.log('🔍 Pins API - Using service role client to bypass authentication');

    // Filter out any undefined or null values
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined && value !== null)
    );

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    console.log('PUT /api/pins/[id] - Filtered update data:', updateData);

    // Update using service role client (bypasses all authentication and RLS)
    const { data: updatedPin, error: updateError } = await serviceSupabase
      .from('pins')
      .update(updateData)
      .eq('id', pinId)
      .select()
      .single();

    if (updateError) {
      console.error('PUT /api/pins/[id] - Update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update pin', 
        details: updateError.message 
      }, { status: 500 });
    }

    if (!updatedPin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    console.log('PUT /api/pins/[id] - Successfully updated pin:', updatedPin);
    return NextResponse.json(updatedPin);

  } catch (error) {
    console.error('PUT /api/pins/[id] - Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClientFromRequest(request);
    const pinId = params.id;

    // Get the authenticated user (same pattern as accounts/me API)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        details: authError?.message || 'No user found'
      }, { status: 401 });
    }

    // First, check if the pin exists and get ownership info using the authenticated client
    const { data: existingPin, error: pinError } = await supabase
      .from('pins')
      .select('id, account_id')
      .eq('id', pinId)
      .single();

    if (pinError || !existingPin) {
      return NextResponse.json({ 
        error: 'Pin not found' 
      }, { status: 404 });
    }

    // Check ownership - account_id should match user.id
    if (existingPin.account_id !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied - you can only delete your own pins' 
      }, { status: 403 });
    }

    // Delete using the authenticated client (let RLS handle access control)
    const { error: deleteError } = await supabase
      .from('pins')
      .delete()
      .eq('id', pinId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete pin' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
