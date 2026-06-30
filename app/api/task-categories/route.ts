import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserTaskCategories, createTaskCategory } from "@/lib/task-categories";
import { taskCategorySchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    const data = await getUserTaskCategories(user.userId);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    const body = await request.json();
    const parsed = taskCategorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: { message: "اطلاعات واردشده معتبر نیست." } }, { status: 400 });
    const category = await createTaskCategory(user.userId, parsed.data);
    return NextResponse.json({ ok: true, data: category }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
