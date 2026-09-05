import { NextResponse } from "next/server";
import { plannerApi } from "@/lib/planner-api";
import { focusSchema } from "@/lib/planner-validation";
import { saveFocus } from "@/lib/planner";
export async function PUT(request: Request) {
  return plannerApi(async (userId) => {
    const { date, focus } = focusSchema.parse(await request.json());
    await saveFocus(userId, date, focus);
    return NextResponse.json({ ok: true });
  });
}
