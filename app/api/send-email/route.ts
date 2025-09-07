import { NextRequest, NextResponse } from 'next/server';
import { sendBoxCreationEmail } from '@/lib/email-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Set the session for the client
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Authenticated user for email:', user.id);

    // Parse request body
    const body = await request.json();
    const { firstName, email, boxDescription, boxPrice, boxLocation } = body;

    // Validate required fields
    if (!firstName || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: firstName, email' },
        { status: 400 }
      );
    }

    // Send the email
    const result = await sendBoxCreationEmail({
      firstName,
      email,
      boxDescription,
      boxPrice,
      boxLocation,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
