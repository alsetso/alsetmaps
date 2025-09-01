/**
 * Environment variable validation utility
 * Ensures all required environment variables are present
 */

export function validateEnvironmentVariables() {
  // Only check client-side variables in the browser
  const isClient = typeof window !== 'undefined';
  
  const requiredVars = {
    // Public variables (available in browser)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_RAPIDAPI_KEY: process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
  };

  // Only check server variables on the server side
  if (!isClient) {
    Object.assign(requiredVars, {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
    });
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    if (typeof window !== 'undefined') {
      // Client-side error handling
      console.error('❌ Missing required client-side environment variables:', missingVars);
      console.error('Please check your .env.local file');
      console.error('Some features may not work properly without these variables');
    } else {
      // Server-side error handling
      console.error('❌ Missing required server-side environment variables:', missingVars);
      console.error('Please check your .env.local file');
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  } else {
    if (typeof window !== 'undefined') {
      console.log('✅ All required client-side environment variables are present');
    } else {
      console.log('✅ All required environment variables are present');
    }
  }

  return missingVars.length === 0;
}

/**
 * Validate only server-side environment variables
 * Use this for API routes and server-side functions
 */
export function validateServerEnvironmentVariables() {
  const requiredServerVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  };

  const missingVars = Object.entries(requiredServerVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required server-side environment variables:', missingVars);
    console.error('Please check your .env.local file');
    return false;
  } else {
    console.log('✅ All required server-side environment variables are present');
    return true;
  }
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    console.warn(`⚠️ Environment variable ${key} is not set`);
  }
  return value || fallback || '';
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Validate only client-side environment variables
 * Use this for frontend components
 */
export function validateClientEnvironmentVariables() {
  const requiredClientVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_RAPIDAPI_KEY: process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
  };

  const missingVars = Object.entries(requiredClientVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required client-side environment variables:', missingVars);
    console.error('Please check your .env.local file');
    return false;
  } else {
    console.log('✅ All required client-side environment variables are present');
    return true;
  }
}
