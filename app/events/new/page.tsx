import { PlannerShell } from "@/components/planner/planner-shell";
import { EventForm } from "@/components/planner/event-form";
import { requireUser } from "@/lib/auth";
import { todayKey, validDateKey } from "@/lib/planner-dates";
export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser();
  const { date } = await searchParams;
  return (
    <PlannerShell userId={user.userId}>
      <h1 className="mb-6 text-xl font-bold">رویداد تازه</h1>
      <EventForm
        initial={{
          title: "",
          description: "",
          eventDate: date && validDateKey(date) ? date : todayKey(),
          startTime: "09:00",
          endTime: null,
          allDay: false,
          reminderAt: null,
        }}
      />
    </PlannerShell>
  );
}
