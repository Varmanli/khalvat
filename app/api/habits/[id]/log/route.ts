import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getJalaliParts } from "@/lib/date";
import {
  upsertHabitLog,
  getUserHabitById,
  getHabitLogsForJalaliMonth,
  isHabitScheduledForDate,
} from "@/lib/habits";
import {
  canLogHabitOnDate,
  getTodayDateString,
  parseDateString,
} from "@/lib/habit-utils";
import { habitLogSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const todayJalali = getJalaliParts(new Date());
    const year = parseInt(searchParams.get("year") ?? String(todayJalali.jy), 10);
    const month = parseInt(searchParams.get("month") ?? String(todayJalali.jm), 10);

    const logs = await getHabitLogsForJalaliMonth(user.userId, id, year, month);
    return NextResponse.json({ ok: true, data: logs });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { id } = await params;

    const habit = await getUserHabitById(user.userId, id);
    if (!habit) return NextResponse.json({ ok: false, error: { message: "عادت پیدا نشد." } }, { status: 404 });

    const body = await request.json();
    const parsed = habitLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: "اطلاعات واردشده معتبر نیست.", details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const today = getTodayDateString();
    if (!canLogHabitOnDate(parsed.data.date, today)) {
      return NextResponse.json(
        { ok: false, error: { message: "ثبت عادت فقط برای امروز، دیروز و دو روز قبل ممکن است." } },
        { status: 400 }
      );
    }

    if (!isHabitScheduledForDate(habit, parseDateString(parsed.data.date))) {
      return NextResponse.json(
        { ok: false, error: { message: "برای این روز برنامه‌ای برای این عادت ثبت نشده است." } },
        { status: 400 }
      );
    }

    const log = await upsertHabitLog(user.userId, id, parsed.data);
    return NextResponse.json({ ok: true, data: log }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
