import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTodayCheckInDateKey, getUserCheckInByDateKey, upsertUserCheckIn } from "@/lib/check-ins";
import { dailyCheckInSchema } from "@/lib/validations";

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
    const dateKey = searchParams.get("dateKey") ?? getTodayCheckInDateKey();
    const data = await getUserCheckInByDateKey(user.userId, dateKey);

    return NextResponse.json({
      ok: true,
      data: {
        dateKey,
        submitted: Boolean(data),
        checkIn: data,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد." } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = dailyCheckInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message: parsed.error.issues[0]?.message ?? "اطلاعات واردشده معتبر نیست.",
          },
        },
        { status: 400 }
      );
    }

    const data = await upsertUserCheckIn(user.userId, parsed.data);
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد." } },
      { status: 500 }
    );
  }
}

export const PUT = POST;
