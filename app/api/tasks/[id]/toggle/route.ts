import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleTaskDone } from "@/lib/tasks";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } }, { status: 401 });
    const { id } = await params;
    const task = await toggleTaskDone(user.userId, id);
    if (!task) return NextResponse.json({ ok: false, error: { message: "وظیفه پیدا نشد." } }, { status: 404 });
    return NextResponse.json({ ok: true, data: task });
  } catch {
    return NextResponse.json({ ok: false, error: { message: "خطایی رخ داد." } }, { status: 500 });
  }
}
