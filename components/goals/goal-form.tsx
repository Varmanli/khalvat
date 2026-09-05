"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Target,
} from "lucide-react";
import { JalaliDateTimePicker } from "@/components/ui/jalali-date-time-picker";
import { CustomSelect } from "@/components/ui/custom-select";
import { PERSIAN_WEEKDAYS } from "@/components/habits/habit-repeat-picker";

function normalizeDateOnly(value: string | null | undefined) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

const steps = [
  { label: "هدف", hint: "چی می‌خوای؟" },
  { label: "زمان", hint: "تا کی؟" },
  { label: "معیار", hint: "چطور بسنجیم؟" },
  { label: "برنامه", hint: "چطور پیش بریم؟" },
];

export function GoalForm() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [successCriteriaText, setSuccessCriteriaText] = useState("");

  const [data, setData] = useState<any>({
    title: "",
    description: "",
    motivation: "",
    type: "medium_term",
    status: "active",
    progressMethod: "manual",
    progress: 0,
    priority: "medium",
    successCriteria: [],
    weeklyDays: [],
    customDaysPerMonth: null,
  });

  const set = (key: string, value: any) =>
    setData((current: any) => ({
      ...current,
      [key]: value,
    }));

  const submit = async () => {
    if (!data.title.trim()) {
      return toast.error("یک عنوان برای هدف بنویس.");
    }

    if (data.scheduleType === "weekdays" && data.weeklyDays.length === 0) {
      return toast.error("حداقل یک روز هفته را انتخاب کن.");
    }

    if (data.scheduleType === "custom" && !data.customDaysPerMonth) {
      return toast.error("تعداد روزهای ماه را وارد کن.");
    }

    setBusy(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          successCriteria: successCriteriaText
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const json = await response.json();

      if (!json.ok) {
        throw new Error(json.error?.message ?? "خطایی رخ داد.");
      }

      toast.success("هدف با آرامش ثبت شد.");

      router.push(`/goals/${json.data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطایی رخ داد.");
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (step === 0 && !data.title.trim()) {
      return toast.error("عنوان هدف را بنویس.");
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const previous = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const changeScheduleType = (value: string) => {
    const scheduleType = value || null;
    setData((current: any) => ({
      ...current,
      scheduleType,
      weeklyDays: scheduleType === "weekdays" ? current.weeklyDays ?? [] : [],
      customDaysPerMonth:
        scheduleType === "custom" ? current.customDaysPerMonth ?? null : null,
    }));
  };

  return (
    <div className="space-y-7">
      <StepProgress step={step} onStepChange={setStep} />

      <div className="min-h-90">
        {step === 0 && (
          <div className="space-y-5">
            <StepHeader
              eyebrow="شروع مسیر"
              title="دقیقاً می‌خوای به چی برسی؟"
              description="فعلاً فقط خود هدف رو روشن کن؛ لازم نیست همه جزئیات از همین اول معلوم باشن."
            />

            <Field
              label="عنوان هدف"
              value={data.title}
              onChange={(value: string) => set("title", value)}
              placeholder="مثلاً: رسیدن به سطح B1 انگلیسی"
              autoFocus
            />

            <Text
              label="کمی درباره این هدف"
              value={data.description}
              onChange={(value: string) => set("description", value)}
              placeholder="می‌خوای به کجا برسی و این هدف دقیقاً شامل چه چیزهایی می‌شه؟"
            />

            <Text
              label="چرا برات مهمه؟"
              value={data.motivation}
              onChange={(value: string) => set("motivation", value)}
              placeholder="دلیلی که باعث می‌شه بخوای ادامه بدی..."
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <StepHeader
              eyebrow="زمان و اهمیت"
              title="برای این مسیر چه بازه‌ای داری؟"
              description="فشار اضافی لازم نیست؛ فقط یک چارچوب زمانی و اولویت مشخص کن."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="بازه هدف"
                value={data.type}
                onChange={(value: string) => set("type", value)}
                options={[
                  ["short_term", "کوتاه‌مدت"],
                  ["medium_term", "میان‌مدت"],
                  ["long_term", "بلندمدت"],
                ]}
              />

              <Select
                label="اولویت"
                value={data.priority}
                onChange={(value: string) => set("priority", value)}
                options={[
                  ["low", "کم"],
                  ["medium", "متوسط"],
                  ["high", "زیاد"],
                  ["urgent", "فوری"],
                ]}
              />

              <JalaliDateTimePicker
                label="تاریخ شروع"
                value={data.startDate ?? null}
                onChange={(value) => set("startDate", normalizeDateOnly(value))}
                placeholder="انتخاب تاریخ شروع..."
                clearable
                withTime={false}
              />

              <JalaliDateTimePicker
                label="تاریخ هدف"
                value={data.targetDate ?? null}
                onChange={(value) => set("targetDate", normalizeDateOnly(value))}
                placeholder="انتخاب تاریخ هدف..."
                clearable
                withTime={false}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <StepHeader
              eyebrow="تعریف پیشرفت"
              title="از کجا بفهمیم داری جلو می‌ری؟"
              description="یک روش اندازه‌گیری انتخاب کن تا پیشرفت هدف فقط حسی نباشه."
            />

            <Select
              label="روش سنجش پیشرفت"
              value={data.progressMethod}
              onChange={(value: string) => set("progressMethod", value)}
              options={[
                ["manual", "درصد دستی"],
                ["milestones", "مرحله‌ها"],
                ["tasks", "وظیفه‌های متصل"],
                ["habits", "عادت‌ها / جلسه‌ها"],
                ["numeric", "هدف عددی"],
                ["time", "زمان هدف"],
              ]}
            />

            {["numeric", "time"].includes(data.progressMethod) && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="مقدار فعلی"
                  type="number"
                  value={data.currentValue ?? ""}
                  onChange={(value: string) =>
                    set("currentValue", value ? Number(value) : null)
                  }
                />

                <Field
                  label="مقدار هدف"
                  type="number"
                  value={data.targetValue ?? ""}
                  onChange={(value: string) =>
                    set("targetValue", value ? Number(value) : null)
                  }
                />

                <Field
                  label="واحد"
                  value={data.unit ?? ""}
                  onChange={(value: string) => set("unit", value)}
                  placeholder="ساعت، کتاب..."
                />
              </div>
            )}

            <Text
              label="موفقیت برای تو چه شکلی دارد؟"
              hint="هر خط یک معیار"
              value={successCriteriaText}
              onChange={(value: string) => setSuccessCriteriaText(value)}
              placeholder={
                "مثلاً:\nبتونم مکالمه روزمره داشته باشم\nیک متن B1 رو راحت بخونم"
              }
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <StepHeader
              eyebrow="ریتم اجرا"
              title="دوست داری چطور جلو بری؟"
              description="فقط یک ریتم اولیه انتخاب کن؛ بعداً می‌تونی وظیفه‌ها، عادت‌ها و مرحله‌ها رو دقیق‌تر بچینی."
            />

            <Select
              label="ریتم پیشنهادی کار"
              value={data.scheduleType ?? ""}
              onChange={changeScheduleType}
              options={[
                ["", "بعداً تنظیم می‌کنم"],
                ["daily", "هر روز"],
                ["weekdays", "روزهای مشخص هفته"],
                ["custom", "سفارشی"],
              ]}
            />

            {data.scheduleType === "weekdays" && (
              <WeekdaySelector
                value={data.weeklyDays ?? []}
                onChange={(days) => set("weeklyDays", days)}
              />
            )}

            {data.scheduleType === "custom" && (
              <Field
                label="تعداد روز در ماه"
                type="number"
                min={1}
                max={31}
                value={data.customDaysPerMonth ?? ""}
                onChange={(value: string) =>
                  set("customDaysPerMonth", value ? Number(value) : null)
                }
                placeholder="مثلاً ۱۰"
              />
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-primary-soft/15 px-4 py-4">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft/55 text-primary-dark">
                <CircleDot className="size-4" />
              </span>

              <p className="text-xs leading-6 text-muted">
                بعد از ساخت هدف می‌تونی مرحله‌ها، وظیفه‌ها و عادت‌های مرتبط رو
                بهش وصل کنی. لازم نیست همه‌چیز همین الان کامل بشه.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-5">
        <button
          type="button"
          disabled={step === 0 || busy}
          onClick={previous}
          className="inline-flex h-11 items-center gap-1.5 rounded-2xl border border-border bg-background/65 px-4 text-xs font-black text-muted transition-colors hover:border-primary-soft hover:bg-card-soft hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronRight className="size-4" />
          قبلی
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="group inline-flex h-11 items-center gap-1.5 rounded-2xl bg-primary px-5 text-xs font-black text-white shadow-[0_12px_30px_rgba(138,90,68,0.2)] transition-all hover:bg-primary-dark"
          >
            ادامه
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-xs font-black text-white shadow-[0_12px_30px_rgba(138,90,68,0.2)] transition-colors hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-60"
          >
            <Target className="size-4" />
            {busy ? "در حال ساخت..." : "ساخت هدف"}
          </button>
        )}
      </div>
    </div>
  );
}

function StepProgress({
  step,
  onStepChange,
}: {
  step: number;
  onStepChange: (step: number) => void;
}) {
  return (
    <div className="overflow-x-hidden pb-1 scrollbar-none">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 sm:min-w-max sm:flex-nowrap sm:justify-start">
        {steps.map((item, index) => {
          const completed = index < step;
          const active = index === step;

          return (
            <div key={item.label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (index <= step) {
                    onStepChange(index);
                  }
                }}
                disabled={index > step}
                className={[
                  "flex items-center gap-2 rounded-2xl px-2.5 py-2 transition-colors",
                  active
                    ? "bg-primary-soft/45"
                    : completed
                      ? "hover:bg-card-soft"
                      : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : completed
                        ? "bg-primary-soft text-primary-dark"
                        : "bg-card-soft text-muted",
                  ].join(" ")}
                >
                  {completed ? <Check className="size-4" /> : index + 1}
                </span>

                <span className="text-right">
                  <span
                    className={[
                      "block text-xs font-black",
                      active ? "text-primary-dark" : "text-foreground",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>

                  <span className="hidden text-[10px] text-muted sm:block">
                    {item.hint}
                  </span>
                </span>
              </button>

              {index < steps.length - 1 && (
                <span
                  className={[
                    "hidden h-px w-5 sm:block sm:w-8",
                    index < step ? "bg-primary/40" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="pb-1">
      <p className="text-[11px] font-black text-primary">{eyebrow}</p>

      <h2 className="mt-1.5 text-xl font-black text-foreground sm:text-2xl">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-xs leading-6 text-muted sm:text-sm">
        {description}
      </p>
    </div>
  );
}

function Field({ label, hint, onChange, className, ...props }: any) {
  return (
    <label className="block">
      <FieldLabel label={label} hint={hint} />

      <input
        {...props}
        onChange={(event) => onChange(event.target.value)}
        className={[
          "mt-2.5 h-12 w-full rounded-2xl border border-border bg-background/60 px-4 text-sm font-medium text-foreground outline-none transition",
          "placeholder:text-muted/65",
          "hover:border-primary-soft",
          "focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary-soft/30",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className ?? "",
        ].join(" ")}
      />
    </label>
  );
}

function Text({ label, hint, value, onChange, placeholder }: any) {
  return (
    <label className="block">
      <FieldLabel label={label} hint={hint} />

      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
        }}
        placeholder={placeholder}
        className="mt-2.5 min-h-28 w-full resize-y rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-medium leading-7 text-foreground outline-none transition placeholder:text-muted/65 hover:border-primary-soft focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary-soft/30"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <CustomSelect
      key={`${label}-${value ?? ""}`}
      label={label}
      value={value}
      onValueChange={onChange}
      options={options.map(([optionValue, optionLabel]: string[]) => ({
        value: optionValue,
        label: optionLabel,
      }))}
    />
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-black text-foreground">{label}</span>

      {hint && (
        <span className="text-[10px] font-medium text-muted">{hint}</span>
      )}
    </div>
  );
}

function WeekdaySelector({
  value,
  onChange,
}: {
  value: number[];
  onChange: (value: number[]) => void;
}) {
  function toggleDay(day: number) {
    onChange(
      value.includes(day)
        ? value.filter((item) => item !== day)
        : [...value, day].sort((a, b) => a - b),
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black text-foreground">روزهای انجام</p>
        <p className="text-[10px] text-muted">یک یا چند روز را انتخاب کن</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PERSIAN_WEEKDAYS.map((day) => {
          const selected = value.includes(day.value);

          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              aria-pressed={selected}
              className={[
                "rounded-xl border px-3 py-2 text-xs font-black transition-all",
                selected
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border bg-card text-muted hover:border-primary-soft hover:text-primary",
              ].join(" ")}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
