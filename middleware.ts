import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes, static files, and public assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/shared/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // Only handle page routes, not API routes
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
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // Get the session (not just claims) for proper authentication
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    // Only redirect to login for protected pages
    const isProtectedPage = !pathname.startsWith('/login') && 
                           !pathname.startsWith('/auth') && 
                           !pathname.startsWith('/register') && 
                           !pathname.startsWith('/reset-password') &&
                           pathname !== '/'

    if (isProtectedPage && !user) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse

  } catch (error) {
    console.error('Middleware auth error:', error)
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    // Temporarily disable middleware to test
    // '/((?!_next/static|_next/image|favicon.ico|shared/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
