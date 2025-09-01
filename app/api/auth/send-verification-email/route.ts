import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/integrations/resend/client';
import { validateServerEnvironmentVariables } from '@/lib/env-validation';

export async function POST(request: NextRequest) {
  try {
    // Validate server-side environment variables
    if (!validateServerEnvironmentVariables()) {
      return NextResponse.json(
        { error: 'Server configuration error - missing required environment variables' },
        { status: 500 }
      );
    }

    const { email, firstName, lastName } = await request.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Generate verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?email=${encodeURIComponent(email)}`;

    // Send verification email using Resend (server-side)
    await sendVerificationEmail(email, `${firstName} ${lastName}`, verificationUrl);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
