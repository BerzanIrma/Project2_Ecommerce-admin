import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/',
  '/dashboard(.*)',
  '/admin(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Allow all API routes to be public (no auth required)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Allow checkout routes without authentication
    if (req.nextUrl.pathname.includes('/checkout')) {
      return;
    }
    // Allow webhook routes without authentication
    if (req.nextUrl.pathname.includes('/webhook')) {
      return;
    }
    if (req.method === 'GET') {
      return;
    }
    await auth.protect();
    return;
  }
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}