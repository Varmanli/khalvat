import { NextRequest, NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/entries",
  "/reminders",
  "/tasks",
  "/task-categories",
  "/search",
  "/habits",
  "/gratitude",
  "/settings",
  "/admin",
];
const GUEST_ONLY = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("khalvat_token")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname === p);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/entries/:path*",
    "/reminders/:path*",
    "/tasks/:path*",
    "/task-categories/:path*",
    "/search/:path*",
    "/habits/:path*",
    "/gratitude/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
