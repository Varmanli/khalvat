import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserTasks, createTask } from "@/lib/tasks";
import { taskSchema } from "@/lib/validations";
import type { TaskFilters } from "@/lib/tasks";
import type { TaskPriority, TaskStatus } from "@/lib/task-constants";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const filters: TaskFilters = {
      q: searchParams.get("q") || undefined,
      status: (searchParams.get("status") as TaskStatus) || undefined,
      priority: (searchParams.get("priority") as TaskPriority) || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      due: (searchParams.get("due") as TaskFilters["due"]) || undefined,
    };

    const data = await getUserTasks(user.userId, filters);
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
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: { message: "اطلاعات واردشده معتبر نیست." } }, { status: 400 });

    const task = await createTask(user.userId, parsed.data);
    return NextResponse.json({ ok: true, data: task }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
