/**
 * Environment detection utilities
 */

export function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check environment variables
    return process.env.NODE_ENV === 'development';
  }
  
  // Client-side: check hostname
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost');
}

export function isProduction(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check environment variables
    return process.env.NODE_ENV === 'production';
  }
  
  // Client-side: check hostname
  return !isLocalhost() && 
         !window.location.hostname.includes('vercel.app') &&
         !window.location.hostname.includes('netlify.app');
}

export function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  
  // Client-side: use current origin
  return window.location.origin;
}

export function getAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

export function getEnvironmentInfo(): {
  isLocalhost: boolean;
  isProduction: boolean;
  baseUrl: string;
  authCallbackUrl: string;
  nodeEnv: string;
} {
  return {
    isLocalhost: isLocalhost(),
    isProduction: isProduction(),
    baseUrl: getBaseUrl(),
    authCallbackUrl: getAuthCallbackUrl(),
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}
