import { NextRequest, NextResponse } from 'next/server';
import { sendBoxCreationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { testEmail = 'alsetsolutionsinc@gmail.com' } = body;

    // Test email data
    const emailData = {
      firstName: 'Test User',
      email: testEmail,
      boxDescription: 'Looking for investment property in downtown area',
      boxPrice: 250000,
      boxLocation: 'Los Angeles, CA',
    };

    console.log('Sending test email to:', testEmail);

    // Send the email
    const result = await sendBoxCreationEmail(emailData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      sentTo: testEmail,
    });

  } catch (error) {
    console.error('Error in test-email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
