import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
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

// Alternative server client that works better with middleware
export function createServerSupabaseClientFromRequest(request: Request) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Extract cookies from the request headers
          const cookieHeader = request.headers.get('cookie');
          console.log('🔧 Server client: Cookie header:', cookieHeader ? 'Present' : 'Missing');
          
          if (!cookieHeader) return [];
          
          const cookies = cookieHeader.split(';').map(cookie => {
            const [name, value] = cookie.trim().split('=');
            return { name, value };
          });
          
          console.log('🔧 Server client: Parsed cookies:', cookies.map(c => c.name));
          return cookies;
        },
        setAll() {
          // No-op for API routes
        },
      },
    }
  );
}
