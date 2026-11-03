import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Extract the hostname (e.g., 'johnsneakers.saas.local')
  const hostname = request.headers.get('host') || '';
  
  // You would normally query a fast Key-Value store (like Redis) here to get the Saleor API URL
  // For the MVP, we map the subdomain directly to an injected header
  
  const response = NextResponse.next();
  // We pass the tenant domain to the page layer securely
  response.headers.set('x-tenant-domain', hostname);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
