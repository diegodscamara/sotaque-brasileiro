import { type NextRequest } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First handle the session update
  const sessionResponse = await updateSession(request);
  if (sessionResponse.headers.has('location')) {
    return sessionResponse;
  }

  // Then handle internationalization
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/",
    "/(fr|en|pt)/:path*"
  ],
};
