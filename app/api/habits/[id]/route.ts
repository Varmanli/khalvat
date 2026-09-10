import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserHabitById, updateHabit, archiveHabit } from "@/lib/habits";
import { habitUpdateSchema } from "@/lib/validations";

function logHabitRouteError(operation: string, habitId: string | undefined, userId: string | undefined, error: unknown, payload?: unknown) {
  const value = error as { code?: string; message?: string; stack?: string };
  console.error("[habit-api]", {
    operation,
    habitId,
    userId,
    payload,
    databaseCode: value?.code,
    databaseMessage: value?.message,
    stack: value?.stack,
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { id } = await params;
    const habit = await getUserHabitById(user.userId, id);
    if (!habit) return NextResponse.json({ ok: false, error: { message: "عادت پیدا نشد." } }, { status: 404 });

    return NextResponse.json({ ok: true, data: habit });
  } catch (error) {
    logHabitRouteError("get", undefined, undefined, error);
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let id: string | undefined;
  let userId: string | undefined;
  let body: unknown;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    userId = user.userId;

    ({ id } = await params);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ ok: false, error: { message: "شناسه عادت معتبر نیست." } }, { status: 400 });
    }
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: { message: "بدنه درخواست معتبر نیست." } }, { status: 400 });
    }
    const parsed = habitUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: "اطلاعات واردشده معتبر نیست.", details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const updated = await updateHabit(user.userId, id, parsed.data);
    if (!updated) return NextResponse.json({ ok: false, error: { message: "عادت پیدا نشد." } }, { status: 404 });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    logHabitRouteError("update", id, userId, error, body);
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { id } = await params;
    const habit = await getUserHabitById(user.userId, id);
    if (!habit) return NextResponse.json({ ok: false, error: { message: "عادت پیدا نشد." } }, { status: 404 });

    await archiveHabit(user.userId, id);
    return NextResponse.json({ ok: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
