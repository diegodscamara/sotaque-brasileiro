import { type NextRequest } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First handle the session update
  const sessionResponse = await updateSession(request);
  if (sessionResponse.headers.has('location')) {
    return sessionResponse;
  }

  // Then handle internationalization, but skip for auth callback
  if (!request.nextUrl.pathname.startsWith('/api/auth/callback')) {
    return intlMiddleware(request);
  }

  return NextResponse.next(); // Proceed without localization for this path
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/",
    "/(fr|en|pt)/:path*"
  ],
};
