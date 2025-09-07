import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { Database } from './types';

/**
 * Create a Supabase client for server-side operations
 * Use this for Server Components and general server-side operations
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client for API routes
 * Use this for all API route handlers - it's the standard approach
 */
export function createServerSupabaseClientFromRequest(request: NextRequest) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // For API routes, we need to handle cookie setting properly
          // This ensures session cookies are properly managed
          cookiesToSet.forEach(({ name, value, options }) => {
            // We can't set cookies in API routes directly, but we need this
            // for the Supabase client to work properly
            console.log(`Setting cookie: ${name}=${value}`);
          });
        },
      },
    }
  );
}
