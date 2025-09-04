import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { 
      intent_type, 
      pin_id, 
      city, 
      state, 
      budget_min, 
      budget_max, 
      property_type, 
      timeline 
    } = await request.json();

    // Validate required fields
    if (!intent_type || !timeline) {
      return NextResponse.json(
        { error: 'Missing required fields: intent_type, timeline' },
        { status: 400 }
      );
    }

    // Validate location constraint: must have either pin_id OR city/state
    if (!pin_id && (!city || !state)) {
      return NextResponse.json(
        { error: 'Must provide either pin_id or both city and state' },
        { status: 400 }
      );
    }

    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get the user's account ID from the accounts table
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (accountError || !accountData) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    // If pin_id is provided, verify it exists and belongs to the user
    if (pin_id) {
      const { data: pinData, error: pinError } = await supabase
        .from('pins')
        .select('id, user_id')
        .eq('id', pin_id)
        .single();

      if (pinError || !pinData) {
        return NextResponse.json(
          { error: 'Pin not found' },
          { status: 404 }
        );
      }

      if (pinData.user_id !== accountData.id) {
        return NextResponse.json(
          { error: 'Access denied to this pin' },
          { status: 403 }
        );
      }
    }

    // Create the intent
    const { data: intent, error: intentError } = await supabase
      .from('intents')
      .insert({
        user_id: accountData.id,
        intent_type,
        pin_id: pin_id || null,
        city: city || null,
        state: state || null,
        budget_min: budget_min || null,
        budget_max: budget_max || null,
        property_type: property_type || null,
        timeline
      })
      .select()
      .single();

    if (intentError) {
      console.error('Intent creation error:', intentError);
      return NextResponse.json(
        { error: 'Failed to create intent' },
        { status: 500 }
      );
    }

    console.log('✅ Intent created successfully:', intent);

    return NextResponse.json(intent, { status: 201 });

  } catch (error) {
    console.error('Unexpected error creating intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get the current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
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

    if (accountError || !accountData) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from('intents')
      .select('*')
      .eq('user_id', accountData.id)
      .order('created_at', { ascending: false });

    // Filter by type if specified
    if (type) {
      query = query.eq('intent_type', type);
    }

    const { data: intents, error: intentsError } = await query;

    if (intentsError) {
      console.error('Error fetching intents:', intentsError);
      return NextResponse.json(
        { error: 'Failed to fetch intents' },
        { status: 500 }
      );
    }

    return NextResponse.json({ intents: intents || [] });

  } catch (error) {
    console.error('Unexpected error fetching intents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
