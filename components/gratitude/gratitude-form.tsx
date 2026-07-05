"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, Leaf, Minus, Plus, Sparkles } from "lucide-react";
import { DeleteGratitudeButton } from "@/components/gratitude/delete-gratitude-button";
import { cn } from "@/lib/utils";
import type { GratitudeEntry } from "@/db/schema";

interface GratitudeFormProps {
  initialEntry?: GratitudeEntry | null;
  date: string;
  dateLabel: string;
}

const PLACEHOLDERS = [
  "بابت...",
  "بابت...",
  "بابت...",
  "بابت...",
  "بابت...",
];

const ITEM_ICONS = [Heart, Sparkles, Leaf, Heart, Sparkles];

function getDefaultItems(entry?: GratitudeEntry | null): string[] {
  const saved = entry?.items as string[] | null | undefined;
  return Array.isArray(saved) && saved.length > 0 ? saved : ["", "", ""];
}

export function GratitudeForm({ initialEntry, date, dateLabel }: GratitudeFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(() => getDefaultItems(initialEntry));
  const [note, setNote] = useState(initialEntry?.note ?? "");
  const [saving, setSaving] = useState(false);

  // Reset form whenever the selected date or the underlying entry changes
  useEffect(() => {
    setItems(getDefaultItems(initialEntry));
    setNote(initialEntry?.note ?? "");
  }, [date, initialEntry?.id, initialEntry?.updatedAt]);

  function updateItem(i: number, value: string) {
    setItems((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function addItem() {
    if (items.length < 5) setItems((prev) => [...prev, ""]);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filtered = items.map((s) => s.trim()).filter((s) => s.length > 0);
    if (filtered.length === 0) {
      toast.error("حداقل یک مورد برای شکرگزاری بنویس.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/gratitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, items: filtered, note: note.trim() || null }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
        return;
      }
      // Sync local state to the saved values so form is no longer dirty
      const saved = json.data;
      const savedItems: string[] = Array.isArray(saved?.items) && saved.items.length > 0
        ? saved.items
        : ["", "", ""];
      setItems(savedItems);
      setNote(saved?.note ?? "");
      toast.success(initialEntry ? "تغییرات ذخیره شد." : "شکرگزاری امروز ذخیره شد.");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-1">
        <p className="text-xs font-semibold text-muted">{dateLabel}</p>
        <h2 className="mt-1 text-lg font-black text-foreground">
          امروز بابت چه چیزی قدردانی؟
        </h2>
      </div>

      {initialEntry ? (
        <div className="flex justify-end">
          <DeleteGratitudeButton date={date} />
        </div>
      ) : null}

      <div className="space-y-2.5">
        {items.map((item, i) => {
          const Icon = ITEM_ICONS[i % ITEM_ICONS.length];
          return (
            <div key={i} className="group flex items-center gap-2">
              <div
                className={cn(
                  "relative flex-1 flex items-center gap-3 rounded-2xl border bg-background/60 px-4 py-3 transition-all duration-200",
                  "border-border focus-within:border-primary-soft focus-within:ring-4 focus-within:ring-primary-soft/20"
                )}
              >
                <Icon className="size-4 shrink-0 text-primary-soft" />
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(i, e.target.value)}
                  placeholder={PLACEHOLDERS[i]}
                  className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted/60"
                  maxLength={240}
                  dir="rtl"
                />
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card-soft text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-danger/10 hover:text-danger"
                  aria-label="حذف"
                >
                  <Minus className="size-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {items.length < 5 && (
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-2.5 text-sm font-semibold text-muted transition-all hover:border-primary-soft hover:bg-primary-soft/10 hover:text-primary-dark"
        >
          <Plus className="size-4" />
          افزودن مورد دیگر
        </button>
      )}

      <div className="rounded-2xl border border-border/70 bg-background/50">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="یادداشت کوتاه برای امروز..."
          rows={3}
          maxLength={1000}
          dir="rtl"
          className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-sm font-medium text-foreground outline-none placeholder:text-muted/60 focus:ring-0"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className={cn(
          "w-full rounded-2xl px-5 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(138,90,68,0.22)] transition-all duration-200",
          saving
            ? "bg-primary-soft cursor-not-allowed"
            : "bg-linear-to-l from-primary-dark via-primary to-primary hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(138,90,68,0.3)]"
        )}
      >
        {saving ? "در حال ذخیره..." : "ذخیره شکرگزاری"}
      </button>
    </form>
  );
}
