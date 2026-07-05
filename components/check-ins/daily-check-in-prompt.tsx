"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { CheckInForm } from "@/components/check-ins/check-in-form";
import { getJalaliDateKey } from "@/lib/date";
import type { DailyCheckIn } from "@/db/schema";

const DISMISS_KEY_PREFIX = "daily-checkin-dismissed:";

export function DailyCheckInPrompt() {
  const [open, setOpen] = useState(false);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [existingEntry, setExistingEntry] = useState<DailyCheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  const dismissKey = useMemo(
    () => (dateKey ? `${DISMISS_KEY_PREFIX}${dateKey}` : null),
    [dateKey],
  );

  useEffect(() => {
    let ignore = false;

    async function run() {
      const now = new Date();
      const localDateKey = getJalaliDateKey(now);
      const afterNoon = now.getHours() >= 12;

      setDateKey(localDateKey);

      if (!afterNoon) {
        setLoading(false);
        return;
      }

      const dismissed = sessionStorage.getItem(`${DISMISS_KEY_PREFIX}${localDateKey}`);
      if (dismissed) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/check-ins/today?dateKey=${encodeURIComponent(localDateKey)}`);
        const json = await res.json();
        if (ignore || !json.ok) return;

        if (json.data?.submitted) {
          setExistingEntry(json.data.checkIn ?? null);
          setOpen(false);
        } else {
          setOpen(true);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading || !open || !dateKey) return null;

  function closeForSession() {
    if (dismissKey) {
      sessionStorage.setItem(dismissKey, "1");
    }
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(38,27,20,0.42)] p-3 sm:items-center sm:p-6">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_32px_110px_rgba(43,37,32,0.24)]">
        <button
          type="button"
          onClick={closeForSession}
          aria-label="بستن"
          className="absolute left-4 top-4 z-10 flex size-10 items-center justify-center rounded-2xl border border-border bg-background/85 text-muted transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="pointer-events-none absolute -right-14 -top-16 size-52 rounded-full bg-gold/14 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-primary-soft/18 blur-3xl" />

        <div className="relative p-5 sm:p-7">
          <CheckInForm
            key={String(existingEntry?.updatedAt ?? dateKey)}
            dateKey={dateKey}
            initialEntry={existingEntry}
            title="امروزت چطور بود؟"
            subtitle="چند لحظه وقت بذار و حال امروزت رو ثبت کن."
            submitLabel="ثبت حال امروز"
            onCancel={closeForSession}
            onSuccess={() => {
              if (dismissKey) {
                sessionStorage.setItem(dismissKey, "1");
              }
              setOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
