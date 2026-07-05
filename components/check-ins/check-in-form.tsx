"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, PenLine } from "lucide-react";
import { DAILY_CHECK_IN_OPTIONS } from "@/lib/check-in-options";
import { cn } from "@/lib/utils";
import type { DailyCheckIn } from "@/db/schema";

interface CheckInFormProps {
  dateKey: string;
  initialEntry?: DailyCheckIn | null;
  submitLabel?: string;
  title?: string;
  subtitle?: string;
  notePlaceholder?: string;
  onSuccess?: (entry: DailyCheckIn) => void;
  onCancel?: () => void;
}

export function CheckInForm({
  dateKey,
  initialEntry,
  submitLabel = "ثبت حال امروز",
  title,
  subtitle,
  notePlaceholder = "اگه دوست داشتی چند خط درباره امروزت بنویس…",
  onSuccess,
  onCancel,
}: CheckInFormProps) {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState(initialEntry?.mood ?? "");
  const [selectedEmoji, setSelectedEmoji] = useState(initialEntry?.emoji ?? "");
  const [note, setNote] = useState(initialEntry?.note ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedMood || !selectedEmoji) {
      toast.error("لطفاً حال امروزت را انتخاب کن.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/check-ins/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateKey,
          mood: selectedMood,
          emoji: selectedEmoji,
          note: note.trim() || null,
        }),
      });
      const json = await res.json();

      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
        return;
      }

      toast.success(initialEntry ? "حال امروزت به‌روزرسانی شد." : "حال امروزت ثبت شد.");
      onSuccess?.(json.data);
      router.refresh();
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {(title || subtitle) && (
        <div>
          {title ? <h2 className="text-lg font-black text-foreground">{title}</h2> : null}
          {subtitle ? <p className="mt-2 text-sm leading-7 text-muted">{subtitle}</p> : null}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {DAILY_CHECK_IN_OPTIONS.map((option) => {
          const selected = selectedMood === option.mood;
          return (
            <button
              key={option.mood}
              type="button"
              onClick={() => {
                setSelectedMood(option.mood);
                setSelectedEmoji(option.emoji);
              }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[1.4rem] border-2 px-4 py-3 text-right transition-all duration-150",
                selected
                  ? "border-[#8F5B46] bg-[#FFF9F2] text-[#5A2F1F] shadow-[0_0_0_1px_#EADBCB_inset]"
                  : "border-border bg-background/70 text-foreground hover:border-primary-soft hover:bg-card",
              )}
              aria-pressed={selected}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="text-2xl leading-none">{option.emoji}</span>
                <span className="text-sm font-black">{option.label}</span>
              </span>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border-2",
                  selected
                    ? "border-[#8F5B46] bg-[#8F5B46] text-white"
                    : "border-border bg-card-soft text-transparent",
                )}
              >
                <CheckCircle2 className="size-4" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.5rem] border border-border bg-background/70">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={notePlaceholder}
          rows={4}
          maxLength={1000}
          dir="rtl"
          className="w-full resize-none rounded-[1.5rem] bg-transparent px-4 py-3 text-sm font-medium text-foreground outline-none placeholder:text-muted/70"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white transition-all duration-200",
            saving
              ? "cursor-not-allowed bg-primary-soft"
              : "bg-primary shadow-[0_14px_36px_rgba(138,90,68,0.22)] hover:-translate-y-0.5 hover:bg-primary-dark",
          )}
        >
          <PenLine className="size-4" />
          {saving ? "در حال ذخیره..." : submitLabel}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-background/70 px-5 py-3 text-sm font-black text-muted transition-colors hover:border-primary-soft hover:text-primary"
          >
            بعداً
          </button>
        ) : null}
      </div>
    </form>
  );
}
