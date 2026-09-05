import { NextResponse } from "next/server";
import { z } from "zod";
import { plannerApi, apiError } from "@/lib/planner-api";
import { eventSchema } from "@/lib/planner-validation";
import { saveEvent, getEvent, deleteEvent } from "@/lib/planner";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  return plannerApi(async (userId) => {
    const id = z.uuid().parse((await params).id);
    const event = await getEvent(userId, id);
    return event
      ? NextResponse.json({ ok: true, data: event })
      : apiError("رویداد پیدا نشد.", 404);
  });
}
export async function PUT(request: Request, { params }: Context) {
  return plannerApi(async (userId) => {
    const id = z.uuid().parse((await params).id);
    const event = await saveEvent(
      userId,
      eventSchema.parse(await request.json()),
      id,
    );
    return event
      ? NextResponse.json({ ok: true, data: event })
      : apiError("رویداد پیدا نشد.", 404);
  });
}
export async function DELETE(_request: Request, { params }: Context) {
  return plannerApi(async (userId) => {
    const id = z.uuid().parse((await params).id);
    return (await deleteEvent(userId, id))
      ? NextResponse.json({ ok: true })
      : apiError("رویداد پیدا نشد.", 404);
  });
}
