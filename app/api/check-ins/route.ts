import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDailyCheckInStats, getRecentCheckIns } from "@/lib/check-ins";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitValue = parseInt(searchParams.get("limit") ?? "90", 10);
    const limit = Number.isFinite(limitValue)
      ? Math.max(1, Math.min(limitValue, 365))
      : 90;

    const [history, stats] = await Promise.all([
      getRecentCheckIns(user.userId, limit),
      getDailyCheckInStats(user.userId),
    ]);

    return NextResponse.json({ ok: true, data: { history, stats } });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد." } },
      { status: 500 }
    );
  }
}
