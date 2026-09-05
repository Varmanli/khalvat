import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, verifyToken } from "@/lib/auth";

const PROTECTED = [
  "/today", "/planner", "/calendar", "/events",
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
  const session = token ? verifyToken(token) : null;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname === p);

  if (isProtected && !session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) response.cookies.set(clearAuthCookie());
    return response;
  }
  if (isGuestOnly && session) {
    return NextResponse.redirect(new URL("/today", request.url));
  }
  const response = NextResponse.next();
  if (token && !session) response.cookies.set(clearAuthCookie());
  return response;
}

export const config = {
  matcher: [
    "/today/:path*", "/planner/:path*", "/calendar/:path*", "/events/:path*",
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
