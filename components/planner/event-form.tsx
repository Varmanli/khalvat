"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { JalaliDateTimePicker } from "@/components/ui/jalali-date-time-picker";
import { eventSchema, type EventInput } from "@/lib/planner-validation";
import { toGregorianIso } from "@/lib/date";
export function EventForm({
  id,
  initial,
}: {
  id?: string;
  initial: EventInput;
}) {
  const [value, setValue] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  function field<K extends keyof EventInput>(key: K, data: EventInput[K]) {
    setValue((current) => ({ ...current, [key]: data }));
  }
  async function save(remove = false) {
    const parsed = eventSchema.safeParse(value);
    if (!remove && !parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(id ? `/api/events/${id}` : "/api/events", {
        method: remove ? "DELETE" : id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        ...(!remove && { body: JSON.stringify(value) }),
      });
      if (!response.ok) throw new Error();
      toast.success(remove ? "رویداد حذف شد." : "رویداد ذخیره شد.");
      router.push(`/planner?date=${value.eventDate}`);
    } catch {
      setError("ذخیره نشد. دوباره تلاش کنید.");
    } finally {
      setPending(false);
    }
  }
  return (
    <Card className="mx-auto max-w-2xl p-5 sm:p-7">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <fieldset disabled={pending} className="space-y-5">
          <Input
            label="عنوان رویداد"
            value={value.title}
            onChange={(e) => field("title", e.target.value)}
            maxLength={255}
            required
          />
          <Textarea
            label="توضیحات (اختیاری)"
            value={value.description ?? ""}
            onChange={(e) => field("description", e.target.value)}
            maxLength={2000}
          />
          <JalaliDateTimePicker
            label="روز رویداد"
            disabled={pending}
            value={`${value.eventDate}T12:00:00`}
            onChange={(v) => {
              if (v) field("eventDate", toGregorianIso(new Date(v)));
            }}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              className="size-4 accent-primary"
              type="checkbox"
              checked={value.allDay}
              onChange={(e) => field("allDay", e.target.checked)}
            />
            تمام روز
          </label>
          {!value.allDay && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                dir="ltr"
                type="time"
                label="ساعت شروع"
                required
                value={value.startTime ?? ""}
                onChange={(e) => field("startTime", e.target.value || null)}
              />
              <Input
                dir="ltr"
                type="time"
                label="ساعت پایان (اختیاری)"
                value={value.endTime ?? ""}
                onChange={(e) => field("endTime", e.target.value || null)}
              />
            </div>
          )}
          <JalaliDateTimePicker
            label="یادآور (اختیاری)"
            disabled={pending}
            withTime
            clearable
            value={value.reminderAt}
            onChange={(v) => field("reminderAt", v)}
          />
          <p className="text-xs leading-6 text-muted">
            یادآور در برنامه روزانه و تقویم نمایش داده می‌شود.
          </p>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "در حال ذخیره…" : "ذخیره رویداد"}
          </Button>
          <Link
            className="rounded-xl px-3 py-2 text-sm text-muted hover:bg-card-soft"
            href={`/planner?date=${initial.eventDate}`}
          >
            بازگشت
          </Link>
          {id && (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
            >
              حذف رویداد
            </Button>
          )}
        </div>
        {confirmDelete && (
          <div className="space-y-3 rounded-2xl border border-border p-4">
            <p className="text-sm">این رویداد حذف شود؟</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="danger"
                disabled={pending}
                onClick={() => save(true)}
              >
                حذف
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => setConfirmDelete(false)}
              >
                انصراف
              </Button>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
}
