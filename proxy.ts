
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  const isLoggedIn = Boolean(request.auth);
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/reservations");

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/resources/:path*",
    "/reservations/:path*",
  ],
};
