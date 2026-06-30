import { getRandomVerse } from "@/lib/ganjoor";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getRandomVerse();
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: "verse fetch failed" }, { status: 500 });
  }
}
