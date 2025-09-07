import { NextRequest, NextResponse } from 'next/server';
import { sendBoxCreationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
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

    console.log('Sending email to:', email, 'for user:', firstName);

    // Send the email
    const result = await sendBoxCreationEmail({
      firstName,
      email,
      boxDescription,
      boxPrice,
      boxLocation,
    });

    if (!result.success) {
      console.error('Email sending failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Error in send-email-simple API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
