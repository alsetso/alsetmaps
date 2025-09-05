import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest, createServerSupabaseClient } from '@/integrations/supabase/server-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Pin API: Starting GET request for ID:', params.id);
    console.log('🔍 Pin API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔍 Pin API: Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const pinId = params.id;
    
    // Use service role client to bypass RLS and get the pin
    const supabase = createServerSupabaseClient();
    
    // Also create a client with user session to check authentication
    const supabaseWithAuth = createServerSupabaseClientFromRequest(request);
    const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser();
    
    console.log('🔍 Pin API: Authentication check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    });
    
    // Test connection first
    console.log('🔍 Pin API: Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('pins')
      .select('count')
      .limit(1);
    
    console.log('🔍 Pin API: Connection test result:', { 
      hasTestData: !!testData, 
      testError: testError?.message 
    });
    
    // Fetch the pin directly
    console.log('🔍 Pin API: Querying for pin ID:', pinId);
    const { data: pins, error: pinError } = await supabase
      .from('pins')
      .select('*')
      .eq('id', pinId);
    
    const pin = pins && pins.length > 0 ? pins[0] : null;
    
    console.log('🔍 Pin API: Pin query result', { 
      pinId,
      hasPin: !!pin, 
      pinError: pinError?.message,
      pinErrorCode: pinError?.code,
      pinsFound: pins?.length || 0
    });

    // Debug: Show all pins in database (first 5)
    const { data: allPins, error: allPinsError } = await supabase
      .from('pins')
      .select('id, name, is_public, user_id, created_at')
      .limit(5);
    
    console.log('🔍 Pin API: Sample pins in database:', {
      totalPins: allPins?.length || 0,
      allPinsError: allPinsError?.message,
      samplePins: allPins?.map(p => ({ id: p.id, name: p.name, is_public: p.is_public, user_id: p.user_id }))
    });

    // Debug: Check accounts table
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, auth_user_id, email, created_at')
      .limit(5);
    
    console.log('🔍 Pin API: Sample accounts in database:', {
      totalAccounts: accounts?.length || 0,
      accountsError: accountsError?.message,
      sampleAccounts: accounts?.map(a => ({ id: a.id, auth_user_id: a.auth_user_id, email: a.email }))
    });

    // Debug: Check if the specific pin's user_id exists in accounts
    if (pin && pin.user_id) {
      const { data: pinOwnerAccount, error: ownerError } = await supabase
        .from('accounts')
        .select('id, auth_user_id, email')
        .eq('id', pin.user_id)
        .single();
      
      console.log('🔍 Pin API: Pin owner account lookup:', {
        pinUserId: pin.user_id,
        ownerAccountFound: !!pinOwnerAccount,
        ownerAccount: pinOwnerAccount,
        ownerError: ownerError?.message
      });
    }

    // Debug: Check current user's account
    if (user) {
      const { data: currentUserAccount, error: currentAccountError } = await supabase
        .from('accounts')
        .select('id, auth_user_id, email')
        .eq('auth_user_id', user.id)
        .single();
      
      console.log('🔍 Pin API: Current user account lookup:', {
        authUserId: user.id,
        currentAccountFound: !!currentUserAccount,
        currentAccount: currentUserAccount,
        currentAccountError: currentAccountError?.message
      });

      // Check ownership
      if (pin && currentUserAccount) {
        const isOwner = pin.user_id === currentUserAccount.id;
        console.log('🔍 Pin API: Ownership check:', {
          pinUserId: pin.user_id,
          currentUserAccountId: currentUserAccount.id,
          isOwner: isOwner
        });
      }
    }

    if (pinError) {
      console.error('❌ Pin API: Database error:', pinError);
      return NextResponse.json({ 
        error: 'Database error',
        details: pinError.message
      }, { status: 500 });
    }

    if (!pin) {
      console.log('❌ Pin API: Pin not found in database');
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Fetch search history if pin has search_history_id
    let searchHistory = null;
    if (pin.search_history_id) {
      const { data: searchHistoryData, error: searchHistoryError } = await supabase
        .from('search_history')
        .select('search_address, search_type, created_at, credits_used')
        .eq('id', pin.search_history_id)
        .single();
      
      if (!searchHistoryError && searchHistoryData) {
        searchHistory = searchHistoryData;
      }
    }

    // Check if this pin has a for_sale listing
    const { data: forSaleListing, error: listingError } = await supabase
      .from('for_sale')
      .select(`
        id,
        title,
        description,
        property_type,
        listing_price,
        timeline,
        for_sale_by,
        images,
        contact_info,
        agent_name,
        agent_company,
        agent_phone,
        agent_email,
        status,
        views_count,
        inquiries_count,
        created_at,
        updated_at
      `)
      .eq('pin_id', pinId)
      .eq('status', 'active')
      .single();

    if (listingError && listingError.code !== 'PGRST116') {
      console.warn('⚠️ Pin API: Error fetching for_sale listing:', listingError);
    }

    // Prepare response data
    const responseData = {
      pin: pin,
      searchHistory: searchHistory,
      forSaleListing: forSaleListing || null,
      isOwner: false, // Simplified - let frontend handle this if needed
      isPublic: pin.is_public || false,
      viewCount: pin.view_count || 0,
      lastViewed: pin.last_viewed_at || null
    };

    console.log('✅ Pin API: Successfully returning pin data:', pin.id);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Pin API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the user's account ID from the accounts table
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const pinId = params.id;
    const body = await request.json();

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

    // Update the pin
    const { data: updatedPin, error: updateError } = await supabase
      .from('pins')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', pinId)
      .eq('user_id', accountData.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update pin' }, { status: 500 });
    }

    return NextResponse.json(updatedPin);

  } catch (error) {
    console.error('Error updating pin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the user's account ID from the accounts table
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const pinId = params.id;

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

    // Delete the pin
    const { error: deleteError } = await supabase
      .from('pins')
      .delete()
      .eq('id', pinId)
      .eq('user_id', accountData.id);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete pin' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting pin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
