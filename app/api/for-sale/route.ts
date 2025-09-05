import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/for-sale - Starting request processing');
    
    const {
      pin_id,
      listing_price,
      property_type,
      timeline,
      title,
      description,
      for_sale_by,
      images,
      contact_info,
      agent_name,
      agent_company,
      agent_phone,
      agent_email
    } = await request.json();

    console.log('📝 Request data received:', { pin_id, listing_price, property_type, timeline, for_sale_by });

    // Validate required fields
    if (!pin_id || !listing_price || !property_type || !timeline || !title || !description || !for_sale_by) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: pin_id, listing_price, property_type, timeline, title, description, for_sale_by' },
        { status: 400 }
      );
    }

    // Get authenticated user
    console.log('🔐 Creating server Supabase client...');
    const supabase = createServerSupabaseClient();
    
    console.log('🍪 Available cookies:', request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })));
    console.log('🍪 Cookie header:', request.headers.get('cookie'));
    
    console.log('🔍 Getting session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('📊 Session result:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      userId: session?.user?.id,
      sessionError: sessionError?.message 
    });
    
    if (sessionError || !session?.user) {
      console.log('❌ Authentication failed:', sessionError?.message || 'No session');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user's account ID
    console.log('🔍 Looking up account for auth user:', session.user.id);
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    console.log('📊 Account lookup result:', { 
      hasAccount: !!accountData, 
      accountId: accountData?.id,
      accountError: accountError?.message 
    });

    if (accountError || !accountData) {
      console.log('❌ Account lookup failed:', accountError?.message || 'No account found');
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    console.log('✅ Account found:', accountData.id);

    // Get pin coordinates and verify ownership
    console.log('🔍 Looking up pin:', pin_id, 'for account:', accountData.id);
    const { data: pinData, error: pinError } = await supabase
      .from('pins')
      .select('latitude, longitude')
      .eq('id', pin_id)
      .eq('user_id', accountData.id)
      .single();

    console.log('📊 Pin lookup result:', { 
      hasPin: !!pinData, 
      pinError: pinError?.message,
      coordinates: pinData ? { lat: pinData.latitude, lng: pinData.longitude } : null
    });

    if (pinError || !pinData) {
      console.log('❌ Pin lookup failed:', pinError?.message || 'No pin found');
      return NextResponse.json({ error: 'Pin not found or access denied' }, { status: 404 });
    }

    console.log('✅ Pin found with coordinates:', pinData.latitude, pinData.longitude);

    // Update pin with listing data
    const listingData = {
      name: title, // Use title as the pin name
      notes: description, // Use description as notes
      listing_price: parseInt(listing_price),
      property_type,
      timeline,
      for_sale_by: for_sale_by,
      images: images || [],
      contact_info: contact_info || {},
      agent_name: agent_name || null,
      agent_company: agent_company || null,
      agent_phone: agent_phone || null,
      agent_email: agent_email || null,
      listing_status: 'active',
      updated_at: new Date().toISOString()
    };

    console.log('🚀 Updating pin with listing data:', listingData);
    
    const { data: listing, error: listingError } = await supabase
      .from('pins')
      .update(listingData)
      .eq('id', pin_id)
      .eq('user_id', accountData.id)
      .select()
      .single();

    console.log('📊 Insert result:', { 
      hasListing: !!listing, 
      listingId: listing?.id,
      listingError: listingError?.message 
    });

    if (listingError) {
      console.error('For sale creation error:', listingError);
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    console.log('✅ For sale listing created successfully:', listing);

    return NextResponse.json(listing, { status: 201 });

  } catch (error) {
    console.error('Unexpected error creating for sale listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
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

    // Get user's listings
    const { data: listings, error: listingsError } = await supabase
      .from('for_sale')
      .select(`
        *,
        pins:pin_id(
          name,
          search_history:search_history_id(
            search_address
          )
        )
      `)
      .eq('user_id', accountData.id)
      .order('created_at', { ascending: false });

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    return NextResponse.json({ listings: listings || [] });

  } catch (error) {
    console.error('Unexpected error fetching listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
