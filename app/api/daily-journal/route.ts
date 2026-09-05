import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveDailyJournal } from "@/lib/planner";
import { dailyJournalSchema } from "@/lib/validations";
import { todayKey } from "@/lib/planner-dates";

export async function PUT(request: Request) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = dailyJournalSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: { message: parsed.error.issues[0]?.message ?? "اطلاعات معتبر نیست." } }, { status: 400 });
  if (parsed.data.close && parsed.data.date > todayKey()) return NextResponse.json({ ok: false, error: { message: "نمی‌شود یک روز آینده را بست." } }, { status: 400 });
  await saveDailyJournal(user.userId, parsed.data); return NextResponse.json({ ok: true });
}
