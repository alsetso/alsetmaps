import { NextRequest, NextResponse } from 'next/server';
import { sendBoxDeletionEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, email, boxDescription, boxPrice, boxLocation } = body;

    // Validate required fields
    if (!firstName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName and email' },
        { status: 400 }
      );
    }

    // Send the deletion email
    const { messageId, error } = await sendBoxDeletionEmail({
      firstName,
      email,
      boxDescription,
      boxPrice,
      boxLocation,
    });

    if (error) {
      console.error('Failed to send deletion email:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId,
      message: 'Deletion email sent successfully',
    });
  } catch (error) {
    console.error('Error in send-delete-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
