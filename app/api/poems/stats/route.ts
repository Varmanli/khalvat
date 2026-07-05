import { NextResponse } from "next/server";
import { getPoemStats } from "@/lib/poems";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getPoemStats();
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطا در دریافت آمار شعرها." } },
      { status: 500 }
    );
  }
}
