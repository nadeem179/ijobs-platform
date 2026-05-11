import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/applications",
  "/saved-jobs",
  "/profile",
  "/recruiter",
];

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("sb-access-token") ||
    request.cookies.get("supabase-auth-token");

  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/applications/:path*",
    "/saved-jobs/:path*",
    "/profile/:path*",
    "/recruiter/:path*",
  ],
};