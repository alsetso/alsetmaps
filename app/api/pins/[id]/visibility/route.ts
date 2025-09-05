import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Pin Visibility API: Starting PUT request for ID:', params.id);
    
    const pinId = params.id;
    const { is_public } = await request.json();
    
    // Use request-based client to get proper permissions
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user's account ID
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
      .select('id, user_id')
      .eq('id', pinId)
      .eq('user_id', accountData.id)
      .single();

    if (fetchError || !existingPin) {
      return NextResponse.json({ error: 'Pin not found or access denied' }, { status: 404 });
    }

    // Update the pin visibility
    const updateData: any = { is_public };
    
    // Generate share token if making public
    if (is_public) {
      updateData.share_token = crypto.randomUUID();
    } else {
      updateData.share_token = null;
    }

    const { data: updatedPin, error: updateError } = await supabase
      .from('pins')
      .update(updateData)
      .eq('id', pinId)
      .eq('user_id', accountData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating pin visibility:', updateError);
      return NextResponse.json({ error: 'Failed to update pin visibility' }, { status: 500 });
    }

    console.log('✅ Pin Visibility API: Successfully updated pin visibility:', pinId);
    return NextResponse.json(updatedPin);

  } catch (error) {
    console.error('❌ Pin Visibility API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Pin Visibility API: Starting GET request for ID:', params.id);
    
    const pinId = params.id;
    
    // Use request-based client to get proper permissions
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user's account ID
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Get the pin visibility info
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .select('id, is_public, share_token, view_count, last_viewed_at')
      .eq('id', pinId)
      .eq('user_id', accountData.id)
      .single();

    if (pinError || !pin) {
      return NextResponse.json({ error: 'Pin not found or access denied' }, { status: 404 });
    }

    console.log('✅ Pin Visibility API: Successfully retrieved pin visibility:', pinId);
    return NextResponse.json(pin);

  } catch (error) {
    console.error('❌ Pin Visibility API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
