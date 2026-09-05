import { notFound } from "next/navigation";
import { z } from "zod";
import { PlannerShell } from "@/components/planner/planner-shell";
import { EventForm } from "@/components/planner/event-form";
import { requireUser } from "@/lib/auth";
import { getEvent } from "@/lib/planner";
export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const event = await getEvent(user.userId, id);
  if (!event) notFound();
  return (
    <PlannerShell userId={user.userId}>
      <h1 className="mb-6 text-xl font-bold">ویرایش رویداد</h1>
      <EventForm
        id={id}
        initial={{
          ...event,
          reminderAt: event.reminderAt?.toISOString() ?? null,
        }}
      />
    </PlannerShell>
  );
}
