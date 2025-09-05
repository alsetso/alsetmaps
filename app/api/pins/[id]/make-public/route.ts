import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

/**
 * Make a pin public - for testing purposes
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Make Public API: Starting POST request for ID:', params.id);
    
    const pinId = params.id;
    const supabase = createServerSupabaseClient();
    
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

    // Update the pin to be public
    const { data: updatedPin, error: updateError } = await supabase
      .from('pins')
      .update({
        is_public: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', pinId)
      .eq('user_id', accountData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error making pin public:', updateError);
      return NextResponse.json({ error: 'Failed to make pin public' }, { status: 500 });
    }

    console.log('✅ Make Public API: Successfully made pin public');
    return NextResponse.json({ 
      success: true, 
      pin: updatedPin,
      message: 'Pin is now public and shareable'
    });

  } catch (error) {
    console.error('❌ Make Public API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
