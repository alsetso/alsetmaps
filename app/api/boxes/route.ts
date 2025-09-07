import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';
import { createBoxSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client for server-side operations
    const supabase = createServerSupabaseClientFromRequest(request);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      console.error('Request headers:', Object.fromEntries(request.headers.entries()));
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

    // Get the user's public.users.id from their supabase_id
    console.log('Looking up user with supabase_id:', user.id);
    const { data: publicUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_id', user.id)
      .single();

    if (userError || !publicUser) {
      console.error('Error finding public user:', userError);
      console.error('User lookup failed for supabase_id:', user.id);
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

    // Insert the new box
    console.log('Inserting box with data:', boxData);
    const { data: newBox, error: insertError } = await supabase
      .from('boxes')
      .insert(boxData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating box:', insertError);
      console.error('Box data that failed:', boxData);
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

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
