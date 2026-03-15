import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add logic here if you want to protect routes at the edge
  // For now, we are just ensuring the matcher works as intended to prevent redirects on public APIs
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/send-welcome-email (Public API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (auth page)
     * - signup (auth page)
     * - blog (public content)
     */
    "/((?!api/send-welcome-email|_next/static|_next/image|favicon.ico|login|signup|blog).*)",
  ],
};
