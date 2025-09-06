import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pinId = params.id;
    const { is_public } = await request.json();
    
    const supabase = createServerSupabaseClientFromRequest(request);

    // Update the pin visibility - RLS policies will handle access control
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
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update pin visibility' }, { status: 500 });
    }

    if (!updatedPin) {
      return NextResponse.json({ error: 'Pin not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(updatedPin);

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pinId = params.id;
    
    const supabase = createServerSupabaseClientFromRequest(request);

    // Get the pin visibility info - RLS policies will handle access control
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .select('id, is_public, share_token, view_count, last_viewed_at')
      .eq('id', pinId)
      .single();

    if (pinError || !pin) {
      return NextResponse.json({ error: 'Pin not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(pin);

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
