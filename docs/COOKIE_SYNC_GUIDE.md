# Cookie Sync Guide: Client-Server Authentication with Supabase

This guide explains how cookies are properly synced between the client and server for Supabase authentication in Next.js App Router.

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ──────> │  Middleware  │ ──────> │ API Routes  │
│   (Client)  │         │  (Refresh)   │         │  (Server)   │
└─────────────┘         └──────────────┘         └─────────────┘
     │                          │                        │
     │                          │                        │
     ▼                          ▼                        ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ createBrowser│         │ createServer │         │ createServer │
│   Client    │         │   Client     │         │   Client    │
│ (@supabase/ │         │ (@supabase/  │         │ (@supabase/ │
│    ssr)     │         │    ssr)      │         │    ssr)     │
└─────────────┘         └──────────────┘         └─────────────┘
```

## Key Components

### 1. Client-Side (`lib/supabase/client.ts`)

**Purpose**: Creates Supabase client for browser that automatically handles cookies.

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Key Points**:
- Uses `createBrowserClient` from `@supabase/ssr` (NOT `@supabase/supabase-js`)
- Automatically sets cookies in the browser when auth state changes
- Cookies are sent with every request to your Next.js server

### 2. Proxy/Middleware (`proxy.ts` at root)

**Purpose**: Refreshes session cookies on EVERY request to keep them in sync.

```typescript
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}
```

**Key Points**:
- In Next.js 16.1.1+, must be named `proxy.ts` at the project root (not `middleware.ts`)
- Runs on EVERY request (before API routes, pages, etc.)
- Calls `supabase.auth.getUser()` which automatically refreshes expired tokens
- Updates cookies in the response so browser stays in sync
- **Critical**: Without this, cookies will go out of sync and auth will fail

### 3. Server-Side (`lib/supabase/server.ts`)

**Purpose**: Creates Supabase client for server components and API routes.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore in Server Components (middleware handles it)
          }
        },
      },
    }
  )
}
```

**Key Points**:
- Uses `createServerClient` from `@supabase/ssr`
- Reads cookies from `next/headers`
- Can set cookies (but middleware usually handles this)
- Used in API routes and Server Components

## Cookie Flow

### Login Flow

1. **User logs in** → Client calls `supabase.auth.signInWithPassword()`
2. **Supabase sets cookies** → `createBrowserClient` automatically sets cookies in browser
3. **Cookies sent to server** → Browser includes cookies in all requests
4. **Middleware refreshes** → On next request, middleware calls `getUser()` which refreshes tokens
5. **Cookies updated** → Middleware updates cookies in response
6. **Browser receives** → Browser updates cookies from response

### API Route Flow

1. **Client makes API call** → `fetch('/api/profile')` includes cookies
2. **Middleware runs first** → Refreshes session if needed, updates cookies
3. **API route executes** → Uses `createClient()` from `lib/supabase/server.ts`
4. **Server reads cookies** → `cookies().getAll()` gets cookies from request
5. **Supabase validates** → `supabase.auth.getUser()` validates session
6. **Response sent** → With updated cookies if they were refreshed

## Common Issues & Solutions

### Issue: "Auth session missing!"

**Cause**: Cookies not being read by server

**Solutions**:
1. ✅ Ensure using `createBrowserClient` (not regular client)
2. ✅ Ensure proxy is running (check `proxy.ts` exists at root)
3. ✅ Ensure cookies are being sent (check browser DevTools → Application → Cookies)
4. ✅ Clear cookies and log in again (old cookies might be invalid)

### Issue: User logged out randomly

**Cause**: Cookies not being refreshed

**Solutions**:
1. ✅ Ensure proxy is calling `getUser()` (this refreshes tokens)
2. ✅ Ensure proxy returns the response with updated cookies
3. ✅ Check proxy matcher includes your routes

### Issue: Cookies work in browser but not in API routes

**Cause**: Server not reading cookies correctly

**Solutions**:
1. ✅ Ensure using `createServerClient` with cookie handlers
2. ✅ Ensure `cookies()` is awaited: `await cookies()`
3. ✅ Check cookie domain/path settings (should match your domain)

## Best Practices

1. **Always use `@supabase/ssr` clients**:
   - Client: `createBrowserClient`
   - Server: `createServerClient`
   - Never use `@supabase/supabase-js` directly

2. **Proxy must run on all routes**:
   - Include all routes in matcher (except static files)
   - Don't skip API routes

3. **Don't modify cookies manually**:
   - Let Supabase SSR handle cookie management
   - Only access cookies through Supabase clients

4. **Test cookie sync**:
   - Log in → Check cookies in DevTools
   - Make API call → Check server logs for cookies
   - Verify middleware is refreshing tokens

## Debugging

### Check if cookies exist:

```typescript
// In API route or server component
const cookieStore = await cookies()
const allCookies = cookieStore.getAll()
console.log('Cookies:', allCookies.map(c => c.name))
```

### Check if proxy is running:

Add logging to `lib/supabase/middleware.ts`:

```typescript
export async function updateSession(request: NextRequest) {
  console.log('Proxy running for:', request.nextUrl.pathname)
  // ... rest of code
}
```

### Check browser cookies:

1. Open DevTools → Application → Cookies
2. Look for cookies starting with `sb-` or containing `supabase`
3. Verify they have correct domain and path

## Summary

The cookie sync works through:

1. **Client** sets cookies when auth state changes
2. **Proxy** refreshes cookies on every request
3. **Server** reads cookies from request headers
4. **Response** includes updated cookies from proxy

All three components must be properly configured for authentication to work correctly.
