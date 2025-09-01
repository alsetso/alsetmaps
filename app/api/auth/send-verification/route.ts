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

    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Generate verification URL (this would typically be handled by Supabase)
    // For now, we'll create a simple verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?email=${encodeURIComponent(email)}`;

    // Send verification email
    await sendVerificationEmail(email, name, verificationUrl);

    return NextResponse.json({
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
