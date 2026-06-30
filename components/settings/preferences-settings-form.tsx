"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updatePreferencesSchema, type UpdatePreferencesInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

const HOME_OPTIONS: { value: UpdatePreferencesInput["defaultHome"]; label: string }[] = [
  { value: "dashboard", label: "داشبورد" },
  { value: "entries", label: "نوشته‌ها" },
  { value: "tasks", label: "وظایف" },
  { value: "gratitude", label: "شکرگزاری" },
  { value: "habits", label: "عادت‌ها" },
];

interface PreferencesSettingsFormProps {
  defaultHome: string;
  showDailyVerse: boolean;
  showGuideCards: boolean;
}

export function PreferencesSettingsForm({
  defaultHome,
  showDailyVerse,
  showGuideCards,
}: PreferencesSettingsFormProps) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<UpdatePreferencesInput>({
      resolver: zodResolver(updatePreferencesSchema),
      defaultValues: {
        defaultHome: (defaultHome as UpdatePreferencesInput["defaultHome"]) ?? "dashboard",
        showDailyVerse,
        showGuideCards,
      },
    });

  const currentHome = watch("defaultHome");

  async function onSubmit(data: UpdatePreferencesInput) {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
      } else {
        toast.success("تنظیمات ذخیره شد.");
      }
    } catch {
      toast.error("خطایی رخ داد. دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Default home */}
      <div>
        <label className="mb-3 block text-sm font-semibold text-foreground">
          صفحه پیش‌فرض بعد از ورود
        </label>
        <div className="flex flex-wrap gap-2">
          {HOME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("defaultHome", opt.value, { shouldDirty: true })}
              className={cn(
                "rounded-2xl border px-4 py-2 text-sm font-semibold transition-all duration-200",
                currentHome === opt.value
                  ? "border-primary bg-primary text-white shadow-[0_6px_18px_rgba(138,90,68,0.24)]"
                  : "border-border bg-background/70 text-muted hover:border-primary/50 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.defaultHome && (
          <p className="mt-1 text-xs text-danger">{errors.defaultHome.message}</p>
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <ToggleRow
          label="نمایش شعر روز در داشبورد"
          description="یک بیت شعر فارسی در صفحه اصلی"
          {...register("showDailyVerse")}
        />
        <ToggleRow
          label="نمایش کارت‌های راهنما"
          description="نکته‌های روزانه برای استفاده بهتر از خلوت"
          {...register("showGuideCards")}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(138,90,68,0.28)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark disabled:opacity-60"
      >
        {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </button>
    </form>
  );
}

function ToggleRow({
  label,
  description,
  ...props
}: {
  label: string;
  description: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 px-4 py-3.5 hover:bg-card-soft">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      <div className="relative">
        <input type="checkbox" className="peer sr-only" {...props} />
        <div className="h-6 w-11 rounded-full bg-border transition-colors peer-checked:bg-primary" />
        <div className="absolute right-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:-translate-x-5" />
      </div>
    </label>
  );
}
