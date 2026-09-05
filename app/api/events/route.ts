import { NextResponse } from "next/server";
import { plannerApi } from "@/lib/planner-api";
import { eventSchema } from "@/lib/planner-validation";
import { saveEvent } from "@/lib/planner";
export async function POST(request: Request) {
  return plannerApi(async (userId) => {
    const event = await saveEvent(
      userId,
      eventSchema.parse(await request.json()),
    );
    return NextResponse.json({ ok: true, data: event }, { status: 201 });
  });
}
