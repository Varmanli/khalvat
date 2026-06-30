import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateTaskCategory, deleteTaskCategory } from "@/lib/task-categories";
import { taskCategorySchema } from "@/lib/validations";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const parsed = taskCategorySchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: { message: "اطلاعات واردشده معتبر نیست." } }, { status: 400 });
    const category = await updateTaskCategory(user.userId, id, parsed.data);
    if (!category) return NextResponse.json({ ok: false, error: { message: "دسته‌بندی پیدا نشد." } }, { status: 404 });
    return NextResponse.json({ ok: true, data: category });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    const { id } = await params;
    await deleteTaskCategory(user.userId, id);
    return NextResponse.json({ ok: true, data: { message: "دسته‌بندی حذف شد." } });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
