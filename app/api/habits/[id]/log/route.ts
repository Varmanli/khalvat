import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { upsertHabitLog, getUserHabitById, getHabitLogsForMonth } from "@/lib/habits";
import { habitLogSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()), 10);
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1), 10);

    const logs = await getHabitLogsForMonth(user.userId, id, year, month);
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

    const today = new Date().toISOString().slice(0, 10);
    if (parsed.data.date > today) {
      return NextResponse.json(
        { ok: false, error: { message: "امکان ثبت عادت برای روزهای آینده وجود ندارد." } },
        { status: 400 }
      );
    }

    const log = await upsertHabitLog(user.userId, id, parsed.data);
    return NextResponse.json({ ok: true, data: log }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
