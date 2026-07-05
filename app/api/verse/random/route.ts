import { getRandomPoem } from "@/lib/poems";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getRandomPoem();
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "verse fetch failed" }, { status: 500 });
  }
}
