import { NextResponse } from "next/server";
import { getPoemStats, getRandomPoems } from "@/lib/poems";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mood = searchParams.get("mood");
    const tag = searchParams.get("tag");
    const limitValue = parseInt(searchParams.get("limit") ?? "1", 10);
    const excludeIdsRaw = searchParams.get("excludeIds") ?? "";
    const excludeIds = excludeIdsRaw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const poems = await getRandomPoems({
      mood,
      tag,
      excludeIds,
      limit: Number.isFinite(limitValue) ? limitValue : 1,
    });

    const stats = process.env.NODE_ENV === "development" ? await getPoemStats() : null;

    return NextResponse.json(
      {
        ok: true,
        poems,
        meta:
          process.env.NODE_ENV === "development"
            ? {
                ...stats,
                requestedLimit: Number.isFinite(limitValue) ? limitValue : 1,
                excludeCount: excludeIds.length,
              }
            : undefined,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطا در دریافت شعر." } },
      { status: 500 }
    );
  }
}
