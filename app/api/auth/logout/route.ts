import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const cookie = clearAuthCookie();
  cookieStore.set(cookie);
  return NextResponse.json({ ok: true, data: { message: "خروج موفق" } });
}
