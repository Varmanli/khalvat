import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserTaskById, updateTask, deleteTask } from "@/lib/tasks";
import { taskSchema } from "@/lib/validations";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    const { id } = await params;
    const task = await getUserTaskById(user.userId, id);
    if (!task) return NextResponse.json({ ok: false, error: { message: "وظیفه پیدا نشد." } }, { status: 404 });
    return NextResponse.json({ ok: true, data: task });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const parsed = taskSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: { message: "اطلاعات واردشده معتبر نیست." } }, { status: 400 });
    const task = await updateTask(user.userId, id, parsed.data);
    if (!task) return NextResponse.json({ ok: false, error: { message: "وظیفه پیدا نشد." } }, { status: 404 });
    return NextResponse.json({ ok: true, data: task });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    const { id } = await params;
    const existing = await getUserTaskById(user.userId, id);
    if (!existing) return NextResponse.json({ ok: false, error: { message: "وظیفه پیدا نشد." } }, { status: 404 });
    await deleteTask(user.userId, id);
    return NextResponse.json({ ok: true, data: { message: "وظیفه حذف شد." } });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
