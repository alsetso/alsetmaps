import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for certain paths
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and public pages, but handle API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/shared/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Create a new response with updated cookies
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Set cookies on the response
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // IMPORTANT: Always refresh the session in middleware
    // This ensures expired sessions are refreshed and cookies are updated
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    // If session refresh fails, the user is not authenticated
    if (sessionError || !session) {
      // This is normal for unauthenticated users - continue with the request
      return supabaseResponse
    }

    // User is authenticated - continue with the request
    return supabaseResponse

  } catch (error) {
    // If there's any error in the auth process, continue without authentication
    // This prevents the middleware from breaking the request flow
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - shared/ (public shared pages)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|shared/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
