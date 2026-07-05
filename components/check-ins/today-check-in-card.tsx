"use client";

import { useState } from "react";
import { Pencil, Sparkles } from "lucide-react";
import { CheckInForm } from "@/components/check-ins/check-in-form";
import { DeleteCheckInButton } from "@/components/check-ins/delete-check-in-button";
import { getMoodMeta } from "@/lib/check-in-options";
import type { DailyCheckIn } from "@/db/schema";

interface TodayCheckInCardProps {
  dateKey: string;
  initialEntry?: DailyCheckIn | null;
}

export function TodayCheckInCard({
  dateKey,
  initialEntry,
}: TodayCheckInCardProps) {
  const [editing, setEditing] = useState(!initialEntry);

  if (!initialEntry || editing) {
    return (
      <CheckInForm
        key={`${dateKey}-${initialEntry?.updatedAt ?? "new"}`}
        dateKey={dateKey}
        initialEntry={initialEntry}
        title={initialEntry ? "ویرایش حال امروز" : "حال امروزت را ثبت کن"}
        subtitle={
          initialEntry
            ? "اگر خواستی حال یا یادداشت امروزت را به‌روزرسانی کن."
            : "چند لحظه وقت بذار و حال امروزت رو ثبت کن."
        }
        onSuccess={() => setEditing(false)}
        onCancel={initialEntry ? () => setEditing(false) : undefined}
      />
    );
  }

  const meta = getMoodMeta(initialEntry.mood);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 rounded-[1.6rem] border border-border bg-background/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none">{initialEntry.emoji}</span>
          <div>
            <p className="text-sm font-black text-foreground">{meta.label}</p>
            <p className="mt-1 text-xs text-muted">ثبت شده برای امروز</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black text-primary transition-colors hover:border-primary-soft hover:text-primary-dark"
        >
          <Pencil className="size-3.5" />
          ویرایش
        </button>
      </div>

      <div className="flex justify-end">
        <DeleteCheckInButton checkInId={initialEntry.id} label="حذف حال امروز" />
      </div>

      {initialEntry.note ? (
        <div className="rounded-[1.6rem] border border-border bg-card p-4 text-sm leading-7 text-muted">
          {initialEntry.note}
        </div>
      ) : (
        <div className="rounded-[1.6rem] border border-dashed border-border bg-background/65 p-4 text-sm leading-7 text-muted">
          <span className="inline-flex items-center gap-2 font-bold text-foreground">
            <Sparkles className="size-4 text-gold" />
            برای امروز یادداشتی ننوشته‌ای.
          </span>
        </div>
      )}
    </div>
  );
}
