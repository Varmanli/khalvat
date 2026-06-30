import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserGratitudeByDate,
  getUserGratitudeForJalaliMonth,
  upsertUserGratitude,
  deleteUserGratitude,
  getTodayKey,
} from "@/lib/gratitude";
import { getJalaliParts } from "@/lib/date";
import { gratitudeSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (year && month) {
      // year/month are Gregorian; derive Jalali month for the first day of that Gregorian month
      const { jy, jm } = getJalaliParts(`${year}-${String(month).padStart(2, "0")}-01`);
      const data = await getUserGratitudeForJalaliMonth(user.userId, jy, jm);
      return NextResponse.json({ ok: true, data });
    }

    const targetDate = date ?? getTodayKey();
    const data = await getUserGratitudeByDate(user.userId, targetDate);
    return NextResponse.json({ ok: true, data });
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
    if (!user)
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );

    const body = await request.json();
    // Filter empty strings before validation
    if (Array.isArray(body.items)) {
      body.items = body.items.filter((s: unknown) => typeof s === "string" && s.trim().length > 0);
    }

    // Block future dates
    if (body.date && body.date > getTodayKey()) {
      return NextResponse.json(
        { ok: false, error: { message: "امکان ثبت شکرگزاری برای روزهای آینده وجود ندارد." } },
        { status: 400 }
      );
    }

    const parsed = gratitudeSchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "اطلاعات واردشده معتبر نیست.";
      return NextResponse.json(
        { ok: false, error: { message } },
        { status: 400 }
      );
    }

    const data = await upsertUserGratitude(user.userId, parsed.data);
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد." } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date)
      return NextResponse.json(
        { ok: false, error: { message: "تاریخ الزامی است." } },
        { status: 400 }
      );

    await deleteUserGratitude(user.userId, date);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد." } },
      { status: 500 }
    );
  }
}
