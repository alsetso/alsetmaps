import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 API: Starting POST request');
    
    // Create supabase client
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Debug: Check what cookies we're receiving
    const cookieHeader = request.headers.get('cookie');
    console.log('🔧 API: Cookie header:', cookieHeader ? 'Present' : 'Missing');
    console.log('🔧 API: Cookie details:', cookieHeader);
    
    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔧 API: Session check result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      sessionError: sessionError?.message
    });
    
    if (sessionError || !session?.user) {
      console.log('❌ API: Authentication failed', { sessionError: sessionError?.message });
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    const user = session.user;

    // Get user's account ID
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Get the request body
    const { search_history_id, latitude, longitude, user_id } = await request.json();

    console.log('🔧 API received request body:', {
      search_history_id,
      latitude,
      longitude,
      user_id,
      authenticated_user_id: user?.id
    });

    // Validate required fields
    if (!search_history_id || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: search_history_id, latitude, longitude' },
        { status: 400 }
      );
    }

    // Create the pin directly - no extra validation needed
    console.log('🔧 Attempting to create pin with data:', {
      user_id: accountData.id,
      auth_user_id: user.id,
      search_history_id: search_history_id,
      latitude: latitude,
      longitude: longitude
    });
    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .insert({
        user_id: accountData.id, // Keep for business logic
        auth_user_id: user.id, // Add direct auth relationship for RLS
        search_history_id: search_history_id,
        latitude: latitude,
        longitude: longitude
      })
      .select()
      .single();

    if (pinError) {
      console.error('❌ Pin creation error:', pinError);
      console.error('Error details:', {
        message: pinError.message,
        details: pinError.details,
        hint: pinError.hint,
        code: pinError.code
      });
      return NextResponse.json(
        { error: 'Failed to create pin' },
        { status: 500 }
      );
    }
    
    console.log('✅ Pin created successfully:', pin);

    return NextResponse.json(pin, { status: 201 });

  } catch (error) {
    console.error('Unexpected error creating pin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Pins API: Starting GET request');
    
    // Create supabase client
    const supabase = createServerSupabaseClientFromRequest(request);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔍 Pins API: Session check', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      sessionError: sessionError?.message 
    });
    
    if (sessionError || !session?.user) {
      console.log('❌ Pins API: Authentication failed', { sessionError: sessionError?.message });
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get the user's account ID
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    console.log('🔍 Pins API: Account lookup', { 
      accountId: accountData?.id, 
      accountError: accountError?.message 
    });

    if (accountError || !accountData) {
      console.log('❌ Pins API: Account not found', { accountError: accountError?.message });
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    // Get user's pins with search history details
    const { data: pins, error: pinsError } = await supabase
      .from('pins')
      .select(`
        *,
        search_history:search_history(
          search_address,
          search_type,
          created_at
        )
      `)
      .eq('user_id', accountData.id)
      .order('created_at', { ascending: false });

    console.log('🔍 Pins API: Pins query', { 
      pinsCount: pins?.length || 0, 
      pinsError: pinsError?.message 
    });

    if (pinsError) {
      console.error('❌ Pins API: Error fetching pins:', pinsError);
      return NextResponse.json(
        { error: 'Failed to fetch pins' },
        { status: 500 }
      );
    }

    console.log('✅ Pins API: Successfully returning pins:', pins?.length || 0);
    return NextResponse.json({ pins: pins || [] });

  } catch (error) {
    console.error('Unexpected error fetching pins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
