import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createBoxSchema } from '@/lib/validation';

// Alternative approach using service role for user lookup
export async function POST(request: NextRequest) {
  try {
    // Create a service role client for user lookup (bypasses RLS)
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // This should be in your env
    );

    // Create a regular client for authenticated operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get the authenticated user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Set the session for the regular client
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user.id);

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createBoxSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { description, price, state, city, status } = validationResult.data;

    // Get the user's public.users.id using service role (bypasses RLS)
    console.log('Looking up user with supabase_id:', user.id);
    const { data: publicUser, error: userError } = await supabaseService
      .from('users')
      .select('id')
      .eq('supabase_id', user.id)
      .single();

    if (userError || !publicUser) {
      console.error('Error finding public user:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    console.log('Found public user:', publicUser.id);

    // Prepare box data for insertion
    const boxData = {
      description: description || null,
      price: price || null,
      state: state || null,
      city: city || null,
      status,
      user_id: publicUser.id,
    };

    // Insert the new box using the authenticated client
    console.log('Inserting box with data:', boxData);
    const { data: newBox, error: insertError } = await supabase
      .from('boxes')
      .insert(boxData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating box:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create box' },
        { status: 500 }
      );
    }

    console.log('Successfully created box:', newBox.id);

    // Return success response with created box data
    return NextResponse.json(
      {
        success: true,
        data: newBox,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error in POST /api/boxes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
