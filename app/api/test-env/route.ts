import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    // Client-side variables
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_RAPIDAPI_KEY: process.env.NEXT_PUBLIC_RAPIDAPI_KEY ? 'SET' : 'NOT SET',
    
    // Server-side variables
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
    STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID ? 'SET' : 'NOT SET',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'NOT SET',
    
    // Environment
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  const missingClientVars = Object.entries(envCheck)
    .filter(([key, value]) => key.startsWith('NEXT_PUBLIC_') && value === 'NOT SET');

  const missingServerVars = Object.entries(envCheck)
    .filter(([key, value]) => !key.startsWith('NEXT_PUBLIC_') && key !== 'NODE_ENV' && key !== 'timestamp' && value === 'NOT SET');

  return NextResponse.json({
    message: 'Environment check completed',
    environment: envCheck,
    missingClientVars: missingClientVars.map(([key]) => key),
    missingServerVars: missingServerVars.map(([key]) => key),
    status: 'success'
  });
}
