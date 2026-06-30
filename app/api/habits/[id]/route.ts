import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserHabitById, updateHabit, archiveHabit } from "@/lib/habits";
import { habitSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { id } = await params;
    const habit = await getUserHabitById(user.userId, id);
    if (!habit) return NextResponse.json({ ok: false, error: { message: "عادت پیدا نشد." } }, { status: 404 });

    return NextResponse.json({ ok: true, data: habit });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = habitSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: "اطلاعات واردشده معتبر نیست.", details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const updated = await updateHabit(user.userId, id, parsed.data);
    if (!updated) return NextResponse.json({ ok: false, error: { message: "عادت پیدا نشد." } }, { status: 404 });

    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { id } = await params;
    await archiveHabit(user.userId, id);
    return NextResponse.json({ ok: true, data: { archived: true } });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
