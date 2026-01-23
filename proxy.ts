import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Proxy (Middleware)
 * 
 * In Next.js 16.1.1+, use "proxy.ts" instead of "middleware.ts"
 * This runs on EVERY request and is responsible for:
 * 1. Refreshing Supabase session cookies (critical for SSR)
 * 2. Protecting routes that require authentication
 * 3. Redirecting users based on auth state
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
