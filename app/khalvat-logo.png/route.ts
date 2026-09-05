import logo from "@/public/khalvat-logo.png";
import { NextResponse } from "next/server";

// Compatibility endpoint for HTML or service workers from before the logo
// moved from public/ into the Next static asset bundle.
export function GET(request: Request) {
  return NextResponse.redirect(new URL(logo.src, request.url), 308);
}
