"use client";

import React, { useMemo, useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  AlarmClock,
  CalendarDays,
  Check,
  Clock3,
  Folder,
  Leaf,
  Palette,
  Plus,
  Repeat2,
  Save,
  Sparkles,
  Target,
  Type,
  X,
} from "lucide-react";

import { JalaliDateTimePicker } from "@/components/ui/jalali-date-time-picker";
import { CustomSelect } from "@/components/ui/custom-select";
import { habitSchema, type HabitInput } from "@/lib/validations";
import { formatPersianNumber, toPersianDigits } from "@/lib/persian-numbers";
import { cn } from "@/lib/utils";
import type { HabitWithCategory } from "@/lib/habits";
import type { HabitCategory } from "@/db/schema";
import { HabitColorPicker } from "./habit-color-picker";
import { HABIT_ICONS, getHabitIcon, HabitIconPicker } from "./habit-icon-picker";
import { HabitRepeatPicker } from "./habit-repeat-picker";

interface HabitFormProps {
  habit?: HabitWithCategory;
  categories?: HabitCategory[];
}

function getTodayIsoDate() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function normalizeDateOnly(value: string | null | undefined) {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTimeLabel(value?: string | null) {
  if (!value) return "بدون یادآور";

  const [hour = "", minute = ""] = value.split(":");

  if (!hour || !minute) return "بدون یادآور";

  return `${formatPersianNumber(hour)}:${formatPersianNumber(minute)}`;
}

function DynamicHabitIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  return React.createElement(getHabitIcon(iconKey), { className });
}

export function HabitForm({ habit, categories = [] }: HabitFormProps) {
  const router = useRouter();
  const isEdit = Boolean(habit);

  const [icon, setIcon] = useState(habit?.icon ?? "star");
  const [color, setColor] = useState(habit?.color ?? "#8A5A44");
  const [repeatType, setRepeatType] = useState<"daily" | "weekly">(
    habit?.repeatType ?? "daily",
  );
  const [weeklyDays, setWeeklyDays] = useState<number[]>(
    (habit?.weeklyDays as number[]) ?? [],
  );

  const [cats, setCats] = useState<HabitCategory[]>(categories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#8A5A44");
  const [newCategoryIcon, setNewCategoryIcon] = useState("leaf");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HabitInput>({
    resolver: zodResolver(habitSchema) as Resolver<HabitInput>,
    defaultValues: {
      title: habit?.title ?? "",
      shortDescription: habit?.shortDescription ?? "",
      categoryId: habit?.categoryId ?? "",
      color: habit?.color ?? "#8A5A44",
      icon: habit?.icon ?? "star",
      dailyGoal: habit?.dailyGoal ?? undefined,
      unit: habit?.unit ?? "",
      reminderTime: habit?.reminderTime ?? "",
      isActive: habit?.isActive ?? true,
      repeatType: habit?.repeatType ?? "daily",
      weeklyDays: (habit?.weeklyDays as number[]) ?? [],
      durationDays: habit?.durationDays ?? undefined,
      startDate: habit?.startDate ?? getTodayIsoDate(),
      endDate: habit?.endDate ?? null,
    },
  });

  const [
    title,
    shortDescription,
    dailyGoal,
    unit,
    durationDays,
    startDate,
    reminderTime,
    isActive,
  ] = useWatch({
    control,
    name: [
      "title",
      "shortDescription",
      "dailyGoal",
      "unit",
      "durationDays",
      "startDate",
      "reminderTime",
      "isActive",
    ],
  });

  const durationText = useMemo(() => {
    if (!durationDays) return "بدون پایان مشخص";

    const days = Number(durationDays);

    if (!startDate || Number.isNaN(days)) {
      return `برای ${formatPersianNumber(durationDays)} روز دنبال می‌شود.`;
    }

    const end = new Date(startDate);
    end.setDate(end.getDate() + days - 1);

    return `برای ${formatPersianNumber(days)} روز دنبال می‌شود؛ تا ${end.toLocaleDateString(
      "fa-IR",
    )}.`;
  }, [durationDays, startDate]);

  async function onSubmit(data: HabitInput) {
    const payload = {
      ...data,
      icon,
      color,
      repeatType,
      weeklyDays,
      categoryId: data.categoryId || null,
      unit: data.unit || null,
      reminderTime: data.reminderTime || null,
      durationDays: data.durationDays || null,
      dailyGoal: data.dailyGoal || null,
    };

    const url = isEdit ? `/api/habits/${habit!.id}` : "/api/habits";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!json.ok) {
      toast.error(json.error?.message ?? "خطایی رخ داد.");
      return;
    }

    toast.success(isEdit ? "عادت ویرایش شد." : "عادت جدید ثبت شد.");
    router.push(isEdit ? `/habits/${habit!.id}` : "/habits");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <section className="relative overflow-hidden rounded-[1.85rem] border border-border bg-card shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: color }}
        />
        <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative p-5">
          <div className="flex items-start gap-4">
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-3xl text-white shadow-[0_16px_42px_rgba(94,58,47,0.18)]"
              style={{ backgroundColor: color }}
            >
              <DynamicHabitIcon iconKey={icon} className="size-6" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
                <Sparkles className="size-3.5 text-gold" />
                پیش‌نمایش عادت
              </div>

              <h3 className="line-clamp-1 text-lg font-black text-foreground">
                {title?.trim() || "عنوان عادت"}
              </h3>

              <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">
                {shortDescription?.trim() ||
                  "یک توضیح کوتاه کمک می‌کند یادت بماند چرا این عادت را شروع کردی."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <PreviewPill
                  icon={<Target className="size-3.5" />}
                  text={
                    dailyGoal
                      ? `هدف: ${formatPersianNumber(dailyGoal)} ${
                          unit || "مقدار"
                        }`
                      : "بدون هدف عددی"
                  }
                />
                <PreviewPill
                  icon={<AlarmClock className="size-3.5" />}
                  text={formatTimeLabel(reminderTime)}
                />
                <PreviewPill
                  icon={<Repeat2 className="size-3.5" />}
                  text={repeatType === "daily" ? "هر روز" : "روزهای هفته"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FormSection
        icon={<Type className="size-5" />}
        eyebrow="اصل عادت"
        title="اسم و دلیلش را مشخص کن"
        description="عادت را طوری بنویس که وقتی برگشتی، دقیق بدانی قرار است چه چیزی را ادامه بدهی."
      >
        <div className="space-y-4">
          <Field>
            <label className="mb-1.5 block text-sm font-black text-foreground">
              عنوان عادت <span className="text-danger">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="مثلاً: مطالعه، پیاده‌روی، آب خوردن..."
              className="h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          <Field>
            <label className="mb-1.5 block text-sm font-black text-foreground">
              توضیح کوتاه
            </label>
            <input
              {...register("shortDescription")}
              placeholder="مثلاً: چند صفحه کتاب قبل از خواب"
              className="h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
            />
            {errors.shortDescription && (
              <FieldError>{errors.shortDescription.message}</FieldError>
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={<Palette className="size-5" />}
        eyebrow="ظاهر عادت"
        title="رنگ و آیکونش را انتخاب کن"
        description="این‌ها کمک می‌کنند عادت‌ها توی صفحه با یک نگاه قابل تشخیص باشند."
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-black text-foreground">
              آیکون
            </label>
            <HabitIconPicker
              value={icon}
              onChange={(key) => {
                setIcon(key);
                setValue("icon", key, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-foreground">
              رنگ
            </label>
            <HabitColorPicker
              value={color}
              onChange={(nextColor) => {
                setColor(nextColor);
                setValue("color", nextColor, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        icon={<Folder className="size-5" />}
        eyebrow="جای عادت"
        title="دسته‌بندی و وضعیت"
        description="مشخص کن این عادت مربوط به کدام بخش زندگی‌ات است و فعلاً فعال باشد یا نه."
      >
        <div className="space-y-4">
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => {
              const categoryOptions = [
                { value: "", label: "بدون دسته‌بندی" },
                ...cats.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ];

              async function handleCreateCategory() {
                if (!newCategoryName.trim()) {
                  toast.error("نام دسته‌بندی الزامی است.");
                  return;
                }

                setCreatingCategory(true);
                try {
                  const res = await fetch("/api/habit-categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: newCategoryName.trim(),
                      color: newCategoryColor,
                      icon: newCategoryIcon,
                    }),
                  });

                  const json = await res.json();
                  if (!json.ok) {
                    toast.error(json.error?.message ?? "خطایی رخ داد.");
                    return;
                  }

                  setCats((prev) => [...prev, json.data]);
                  setValue("categoryId", json.data.id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setShowNewCategory(false);
                  setNewCategoryName("");
                  setNewCategoryColor("#8A5A44");
                  setNewCategoryIcon("leaf");
                  toast.success("دسته‌بندی ساخته شد.");
                } finally {
                  setCreatingCategory(false);
                }
              }

              return (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
                    <div className="flex-1">
                      <CustomSelect
                        label="دسته‌بندی"
                        value={field.value ?? ""}
                        onValueChange={(val) => field.onChange(val || "")}
                        options={categoryOptions}
                        placeholder="بدون دسته‌بندی"
                        error={errors.categoryId?.message}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(!showNewCategory)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-3 text-xs font-black text-foreground transition-colors hover:border-primary-soft hover:text-primary sm:mb-0"
                    >
                      <Plus className="size-4" />
                      دسته‌بندی جدید
                    </button>
                  </div>

                  {showNewCategory && (
                    <div className="relative overflow-hidden rounded-2xl border border-primary-soft bg-primary-soft/20 p-4">
                      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gold/15 blur-2xl" />

                      <div className="relative space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-black text-foreground">
                              ساخت دسته‌بندی تازه
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-muted">
                              مثلاً سلامتی، مطالعه، خانه، تمرکز...
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowNewCategory(false)}
                            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <Field>
                            <label className="mb-1.5 block text-sm font-black text-foreground">
                              نام دسته‌بندی
                            </label>
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="مثلاً: سلامتی"
                              className="h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-xs font-bold text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
                            />
                          </Field>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-foreground">
                              رنگ
                            </label>
                            <HabitColorPicker
                              value={newCategoryColor}
                              onChange={setNewCategoryColor}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-foreground">
                              آیکون
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {HABIT_ICONS.slice(0, 8).map(({ key, Icon }) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setNewCategoryIcon(key)}
                                  className={cn(
                                    "flex size-10 items-center justify-center rounded-xl border-2 transition-all duration-150",
                                    newCategoryIcon === key
                                      ? "border-foreground bg-card-soft text-primary"
                                      : "border-border text-muted hover:border-primary-soft"
                                  )}
                                >
                                  <Icon className="size-5" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={creatingCategory}
                            className="w-full rounded-xl bg-primary px-3 py-2 text-xs font-black text-white transition-all hover:bg-primary-dark disabled:opacity-60"
                          >
                            {creatingCategory ? "در حال ساخت..." : "ساخت دسته‌بندی"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={
                  field.value
                    ? "flex w-full items-start gap-3 rounded-3xl border border-primary-soft bg-primary-soft/35 p-4 text-right transition-all"
                    : "flex w-full items-start gap-3 rounded-3xl border border-border bg-background/65 p-4 text-right transition-all hover:border-primary-soft hover:bg-primary-soft/20"
                }
              >
                <span
                  className={
                    field.value
                      ? "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white"
                      : "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary"
                  }
                >
                  <Activity className="size-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-foreground">
                    فعال بودن عادت
                  </span>
                  <span className="mt-1 block text-xs leading-6 text-muted">
                    {isActive
                      ? "این عادت در برنامه روزانه‌ات نمایش داده می‌شود."
                      : "این عادت فعلاً از برنامه روزانه کنار گذاشته می‌شود."}
                  </span>
                </span>

                {field.value && (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="size-4" />
                  </span>
                )}
              </button>
            )}
          />
        </div>
      </FormSection>

      <FormSection
        icon={<Target className="size-5" />}
        eyebrow="هدف روزانه"
        title="اگر قابل اندازه‌گیری است، مقدارش را بنویس"
        description="مثلاً ۲۰ صفحه، ۳۰ دقیقه، ۸ لیوان. اگر هم فقط تیکی است، این بخش را خالی بگذار."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <label className="mb-1.5 block text-sm font-black text-foreground">
              هدف روزانه
            </label>
            <input
              {...register("dailyGoal", {
                setValueAs: (value) =>
                  value === "" || value === null ? undefined : Number(value),
              })}
              type="number"
              min="1"
              placeholder="مثلاً: ۲۰"
              className="h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
            />
            {errors.dailyGoal && (
              <FieldError>{errors.dailyGoal.message}</FieldError>
            )}
          </Field>

          <Field>
            <label className="mb-1.5 block text-sm font-black text-foreground">
              واحد
            </label>
            <input
              {...register("unit")}
              placeholder="صفحه، دقیقه، لیوان، قدم..."
              className="h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
            />
            {errors.unit && <FieldError>{errors.unit.message}</FieldError>}
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={<AlarmClock className="size-5" />}
        eyebrow="یادآور"
        title="یک ساعت آرام برای برگشتن"
        description="اگر دوست داری خلوت بهت یادآوری کند، یک زمان سبک برای این عادت بگذار."
      >
        <Controller
          control={control}
          name="reminderTime"
          render={({ field }) => {
            const hasReminder = Boolean(field.value);

            return (
              <div className="space-y-4">
                <div
                  className={
                    hasReminder
                      ? "relative overflow-hidden rounded-[1.65rem] border border-primary-soft bg-primary-soft/25 p-4"
                      : "relative overflow-hidden rounded-[1.65rem] border border-border bg-background/65 p-4"
                  }
                >
                  <div className="pointer-events-none absolute -left-10 -top-10 size-28 rounded-full bg-gold/12 blur-2xl" />

                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span
                        className={
                          hasReminder
                            ? "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_30px_rgba(138,90,68,0.2)]"
                            : "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary"
                        }
                      >
                        <AlarmClock className="size-5" />
                      </span>

                      <div>
                        <p className="text-sm font-black text-foreground">
                          {hasReminder
                            ? "یادآور فعال است"
                            : "فعلاً یادآوری نداری"}
                        </p>

                        <p className="mt-1 text-xs leading-6 text-muted">
                          {hasReminder
                            ? `هر روز حوالی ${formatTimeLabel(field.value)} یک یادآوری آرام برای این عادت داری.`
                            : "اگر زمان مشخصی برای این عادت داری، اینجا ثبتش کن تا از ذهنت برداشته شود."}
                        </p>
                      </div>
                    </div>

                    {hasReminder && (
                      <button
                        type="button"
                        onClick={() => field.onChange("")}
                        className="inline-flex w-fit items-center justify-center rounded-xl border border-border bg-card/80 px-3 py-2 text-xs font-black text-muted transition-colors hover:border-primary-soft hover:text-primary"
                      >
                        حذف یادآور
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <Field>
                    <label className="mb-1.5 block text-sm font-black text-foreground">
                      زمان یادآور
                    </label>
                    <PersianTimeInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.reminderTime?.message}
                    />
                  </Field>

                  <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 text-center sm:min-w-32">
                    <p className="text-[11px] font-bold text-muted">نمایش</p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {hasReminder ? formatTimeLabel(field.value) : "بدون زمان"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-background/55 px-4 py-3">
                  <p className="text-xs leading-6 text-muted">
                    یادآور فقط برای کمک به برگشتنه؛ اگر یک روز نشد، چیزی خراب
                    نشده.
                  </p>
                </div>
              </div>
            );
          }}
        />
      </FormSection>

      <FormSection
        icon={<Repeat2 className="size-5" />}
        eyebrow="ریتم عادت"
        title="هر روز یا چند روز در هفته؟"
        description="ریتم عادت را با زندگی واقعی خودت هماهنگ کن؛ قرار نیست همه چیز هر روز اتفاق بیفتد."
      >
        <HabitRepeatPicker
          repeatType={repeatType}
          weeklyDays={weeklyDays}
          onRepeatTypeChange={(value) => {
            setRepeatType(value);
            setValue("repeatType", value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          onWeeklyDaysChange={(days) => {
            setWeeklyDays(days);
            setValue("weeklyDays", days, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          error={errors.weeklyDays?.message}
        />
      </FormSection>

      <FormSection
        icon={<CalendarDays className="size-5" />}
        eyebrow="شروع و مدت"
        title="از کِی شروع می‌شود؟"
        description="تاریخ شروع را انتخاب کن و اگر دوست داری، برای عادت یک بازه مشخص بگذار."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <JalaliDateTimePicker
                label="تاریخ شروع *"
                value={field.value ?? null}
                onChange={(value) => {
                  field.onChange(normalizeDateOnly(value));
                }}
                placeholder="انتخاب تاریخ شروع..."
                clearable={false}
                withTime={false}
                placement="auto"
                error={errors.startDate?.message}
              />
            )}
          />

          <Field>
            <label className="mb-1.5 block text-sm font-black text-foreground">
              مدت دنبال کردن
            </label>
            <input
              {...register("durationDays", {
                setValueAs: (value) =>
                  value === "" || value === null ? undefined : Number(value),
              })}
              type="number"
              min="1"
              placeholder="مثلاً: ۳۰ روز"
              className="h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
            />
            {errors.durationDays && (
              <FieldError>{errors.durationDays.message}</FieldError>
            )}
          </Field>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-background/65 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
              <Clock3 className="size-4" />
            </span>

            <div>
              <p className="text-xs font-black text-foreground">
                {durationDays ? "بازه عادت مشخص شد" : "بدون پایان مشخص"}
              </p>
              <p className="mt-1 text-xs leading-6 text-muted">
                {durationText}
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      <div className="sticky bottom-4 z-10 rounded-3xl border border-border bg-card/88 p-3 shadow-[0_18px_70px_rgba(94,58,47,0.13)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 px-1">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft/45 text-primary-dark">
              <Leaf className="size-4" />
            </span>

            <div>
              <p className="text-xs font-black text-foreground">
                {isEdit ? "آماده ذخیره تغییرات" : "آماده ساختن عادت"}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                بعد از ذخیره، به صفحه عادت‌ها برمی‌گردی.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save className="size-4" />
            {isSubmitting
              ? "در حال ذخیره..."
              : isEdit
                ? "ذخیره تغییرات"
                : "ساختن عادت"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Persian 24-hour time input ───────────────────────────────

const hourOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = String(hour).padStart(2, "0");
  return {
    value,
    label: formatPersianNumber(value),
  };
});

const minuteOptions = Array.from({ length: 60 }, (_, minute) => {
  const value = String(minute).padStart(2, "0");
  return {
    value,
    label: formatPersianNumber(value),
  };
});

function PersianTimeInput({
  value,
  onChange,
  error,
}: {
  value?: string | null;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [selHour, selMinute] = value?.match(/^\d{2}:\d{2}$/)
    ? value.split(":")
    : ["", ""];

  function update(hour: string, minute: string) {
    if (!hour) {
      onChange("");
      return;
    }
    onChange(`${hour}:${minute || "00"}`);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <CustomSelect
          value={selHour}
          onValueChange={(h) => update(h, selMinute || "00")}
          options={hourOptions}
          placeholder="ساعت"
        />

        <span className="mt-3 text-lg font-black text-muted">:</span>

        <CustomSelect
          value={selMinute}
          onValueChange={(m) => update(selHour || "00", m)}
          options={minuteOptions}
          placeholder="دقیقه"
        />
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs font-bold text-muted transition-colors hover:text-danger"
        >
          حذف یادآور
        </button>
      )}

      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function FormSection({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative rounded-[1.75rem] border border-border bg-card/72 p-4 shadow-[0_14px_50px_rgba(94,58,47,0.04)] sm:p-5">
      <div className="pointer-events-none absolute -left-12 -top-12 size-32 rounded-full bg-primary-soft/12 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-start gap-3 border-b border-border pb-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark">
            {icon}
          </span>

          <div>
            <p className="text-[11px] font-black text-muted">{eyebrow}</p>
            <h3 className="mt-1 text-sm font-black text-foreground">{title}</h3>
            <p className="mt-1 text-xs leading-6 text-muted">{description}</p>
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs font-bold text-danger">{children}</p>;
}

function PreviewPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 text-[11px] font-black text-muted">
      {icon}
      {text}
    </span>
  );
}
