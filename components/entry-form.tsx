"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertCircle,
  Bell,
  Check,
  Clock3,
  FolderPlus,
  Lightbulb,
  Loader2,
  Palette,
  PenLine,
  Pin,
  Plus,
  Save,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { entrySchema, type EntryInput } from "@/lib/validations";
import {
  ENTRY_TYPE_META,
  MOOD_META,
  STATUS_LABELS,
  type EntryType,
} from "@/lib/constants";
import { TASK_CATEGORY_PALETTE } from "@/lib/task-constants";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { CustomSelect } from "@/components/ui/custom-select";
import { JalaliDateTimePicker } from "@/components/ui/jalali-date-time-picker";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/persian-numbers";
import { htmlToPlainText } from "@/lib/html-utils";
import { persianizeHtmlText } from "@/lib/html-persian-digits";
import type { EntryCategory } from "@/db/schema";

type FormValues = z.input<typeof entrySchema>;

interface EntryFormProps {
  entryId?: string;
  defaultValues?: Partial<EntryInput> & { tags?: string };
  categories?: EntryCategory[];
}

const TYPE_SHORTCUTS: EntryType[] = [
  "note",
  "idea",
  "poem",
  "watch",
  "read",
  "reminder",
  "spark",
];

const TYPE_OPTIONS = TYPE_SHORTCUTS.map((type) => ({
  value: type,
  label: ENTRY_TYPE_META[type].label,
}));

const MOOD_OPTIONS = (
  Object.keys(MOOD_META) as Array<keyof typeof MOOD_META>
).map((key) => ({
  value: key,
  label: MOOD_META[key].label,
}));

const STATUS_OPTIONS = (
  Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>
).map((key) => ({
  value: key,
  label: STATUS_LABELS[key],
}));

const TYPE_HELP: Record<
  EntryType,
  {
    title: string;
    text: string;
    placeholder: string;
  }
> = {
  note: {
    title: "یادداشت آزاد",
    text: "هر چیزی که در ذهنت مانده را بدون وسواس بنویس.",
    placeholder: "چی توی ذهنت مانده؟ همین‌جا آرام بنویس...",
  },
  idea: {
    title: "ایده خام",
    text: "ایده لازم نیست کامل باشد؛ فقط هسته‌اش را نگه دار.",
    placeholder: "جرقه ایده‌ات از کجا شروع شد؟",
  },
  poem: {
    title: "شعر و حس",
    text: "کلمات را همان‌طور که می‌آیند بنویس؛ لازم نیست مرتب باشند.",
    placeholder: "یک بیت، یک تصویر، یک حس...",
  },
  watch: {
    title: "دیدنی",
    text: "فیلم، سریال یا چیزی که می‌خواهی بعداً ببینی را ثبت کن.",
    placeholder: "چی می‌خواهی ببینی؟ چرا یادت مانده؟",
  },
  read: {
    title: "خواندنی",
    text: "کتاب، مقاله یا متنی که باید به آن برگردی را نگه دار.",
    placeholder: "چه چیزی را می‌خواهی بخوانی؟",
  },
  reminder: {
    title: "یادآور",
    text: "چیزی که نباید فراموش شود را با زمان و حال‌وهوا ثبت کن.",
    placeholder: "چه چیزی را باید یادت بماند؟",
  },
  spark: {
    title: "جرقه",
    text: "یک فکر کوتاه، یک تصویر ذهنی، یک شروع کوچک.",
    placeholder: "جرقه‌اش چی بود؟",
  },
};

export function EntryForm({ entryId, defaultValues, categories = [] }: EntryFormProps) {
  const router = useRouter();
  const isEdit = Boolean(entryId);

  const [cats, setCats] = useState<EntryCategory[]>(categories);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(TASK_CATEGORY_PALETTE[0]);
  const [creatingCat, setCreatingCat] = useState(false);

  const categoryOptions = [
    { value: "", label: "بدون دسته‌بندی" },
    ...cats.map((category) => ({ value: category.id, label: category.name })),
  ];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      type: defaultValues?.type ?? "note",
      mood: defaultValues?.mood ?? "neutral",
      status: defaultValues?.status ?? "raw",
      isPinned: defaultValues?.isPinned ?? false,
      reminderAt: defaultValues?.reminderAt ?? null,
      tags: defaultValues?.tags ?? "",
      categoryId: defaultValues?.categoryId ?? "",
    },
  });

  const currentType = useWatch({ control, name: "type" });
  const currentContent = useWatch({ control, name: "content" }) ?? "";
  const currentTitle = useWatch({ control, name: "title" }) ?? "";
  const isPinned = useWatch({ control, name: "isPinned" });

  const currentHelp = TYPE_HELP[currentType as EntryType] ?? TYPE_HELP.note;
  const contentLength = htmlToPlainText(String(currentContent)).length;
  const titleLength = String(currentTitle).trim().length;

  async function createCategory() {
    const name = newCatName.trim();
    if (!name) return;

    setCreatingCat(true);
    try {
      const res = await fetch("/api/entry-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color: newCatColor }),
      });

      const json = await res.json();

      if (json.ok) {
        setCats((prev) => [...prev, json.data]);
        setValue("categoryId", json.data.id, {
          shouldDirty: true,
          shouldValidate: true,
        });
        toast.success("دسته‌بندی ساخته شد.");
        setShowNewCat(false);
        setNewCatName("");
        return;
      }

      toast.error(json.error?.message ?? "خطا در ساخت دسته‌بندی.");
    } finally {
      setCreatingCat(false);
    }
  }

  async function onSubmit(data: FormValues) {
    const payload = {
      ...data,
      content: persianizeHtmlText(data.content),
      reminderAt: data.reminderAt || null,
      categoryId: data.categoryId || null,
    };

    const url = entryId ? `/api/entries/${entryId}` : "/api/entries";
    const method = entryId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.ok) {
      toast.success(isEdit ? "تغییرات ذخیره شد." : "نوشته ثبت شد.");
      const id = entryId ?? json.data?.id;
      router.push(`/entries/${id}`);
      router.refresh();
    } else {
      toast.error(json.error?.message ?? "خطایی رخ داد.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top writing guide */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-background/65 p-4 shadow-inner sm:p-5">
        <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-gold/12 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft to-card-soft text-primary-dark shadow-sm">
              <WandSparkles className="size-5" />
            </span>

            <div>
              <p className="text-sm font-black text-foreground">
                {isEdit ? "ویرایش آرام نوشته" : currentHelp.title}
              </p>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-muted sm:text-sm">
                {isEdit
                  ? "می‌توانی این نوشته را دقیق‌تر، آرام‌تر یا کامل‌تر کنی."
                  : currentHelp.text}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted">
            <Sparkles className="size-4 text-gold" />
            {contentLength > 0
              ? `${formatPersianNumber(contentLength)} نویسه`
              : "شروع کن، کم‌کم شکل می‌گیرد"}
          </div>
        </div>
      </div>

      {/* Type shortcuts */}
      {!isEdit && (
        <FormSection
          icon={<PenLine className="size-4" />}
          title="نوع نوشته"
          description="اول مشخص کن این صفحه چه حال‌وهوایی دارد."
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPE_SHORTCUTS.map((type) => {
              const meta = ENTRY_TYPE_META[type];
              const Icon = meta.icon;
              const isActive = currentType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setValue("type", type, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    "group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border px-3 py-2.5 text-right transition-all duration-200",
                    isActive
                      ? "border-primary bg-primary text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)]"
                      : "border-border bg-card hover:-translate-y-0.5 hover:border-primary-soft hover:bg-background hover:shadow-[0_10px_30px_rgba(94,58,47,0.07)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isActive ? "bg-white/15 text-white" : "bg-card-soft text-primary",
                    )}
                  >
                    <Icon size={15} />
                  </span>

                  <span
                    className={cn(
                      "flex-1 text-sm font-black",
                      isActive ? "text-white" : "text-foreground",
                    )}
                  >
                    {meta.label}
                  </span>

                  {isActive && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Check className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected type hint */}
          <div className="flex items-start gap-3 mt-4 rounded-2xl border border-border bg-background/70 px-4 py-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft/50 text-primary-dark">
              <Lightbulb className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-foreground">{currentHelp.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">{currentHelp.text}</p>
            </div>
          </div>

          {errors.type?.message && <ErrorText message={errors.type.message} />}
        </FormSection>
      )}

      {/* Main writing area */}
      <FormSection
        icon={<PenLine className="size-4" />}
        title="متن نوشته"
        description="عنوان کوتاه، متن اصلی و تگ‌ها را اینجا وارد کن."
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-black text-foreground">
                عنوان
              </label>
              <span className="text-xs font-semibold text-muted">
                {titleLength > 0
                  ? `${formatPersianNumber(titleLength)} نویسه`
                  : "اختیاری ولی بهتر است کوتاه باشد"}
              </span>
            </div>

            <input
              type="text"
              placeholder="عنوان نوشته..."
              {...register("title")}
              className={cn(
                "h-13 w-full rounded-2xl border bg-card px-4 text-base font-bold text-foreground outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary-soft/35",
                errors.title ? "border-danger" : "border-border",
              )}
            />

            {errors.title?.message && (
              <ErrorText message={errors.title.message} />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted">
                {contentLength > 0
                  ? `${formatPersianNumber(contentLength)} نویسه نوشته‌ای`
                  : "از یک جمله هم می‌شود شروع کرد"}
              </span>
            </div>

            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <RichTextEditor
                  label="محتوا"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder={currentHelp.placeholder}
                  error={errors.content?.message}
                  minHeight={320}
                  helperText="از یک جمله هم می‌شود شروع کرد."
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                label="تگ‌ها"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="یک تگ بنویس و Enter بزن..."
                helperText="با Enter یا ویرگول، تگ‌ها را جدا کن. فاصله داخل تگ حفظ می‌شود."
                error={errors.tags?.message}
                maxTags={12}
              />
            )}
          />
        </div>
      </FormSection>

      {/* Category */}
      <FormSection
        icon={<FolderPlus className="size-4" />}
        title="دسته‌بندی"
        description="اگر این نوشته جایش در یک دسته مشخص است، اینجا انتخابش کن."
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <CustomSelect
                    label="دسته‌بندی"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    options={categoryOptions}
                    placeholder="بدون دسته‌بندی"
                    error={errors.categoryId?.message}
                  />
                )}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowNewCat((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-3 text-xs font-black text-primary transition-all duration-200 hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
            >
              <FolderPlus className="size-4" />
              دسته‌بندی جدید
            </button>
          </div>

          {showNewCat && (
            <div className="relative overflow-hidden rounded-3xl border border-border bg-background/65 p-4">
              <div className="pointer-events-none absolute -left-10 -top-10 size-28 rounded-full bg-gold/10 blur-2xl" />

              <div className="relative space-y-3">
                <div>
                  <p className="text-sm font-black text-foreground">
                    ساخت دسته‌بندی تازه
                  </p>
                  <p className="mt-1 text-xs leading-6 text-muted">
                    مثلاً: یادداشت‌های روزانه، ایده‌ها، شعرها
                  </p>
                </div>

                <input
                  type="text"
                  value={newCatName}
                  onChange={(event) => setNewCatName(event.target.value)}
                  placeholder="نام دسته‌بندی..."
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                />

                <div className="flex flex-wrap gap-2">
                  {TASK_CATEGORY_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={
                        newCatColor === color
                          ? "size-7 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-background transition-all"
                          : "size-7 rounded-full ring-1 ring-border transition-all hover:scale-110"
                      }
                      style={{ background: color }}
                      aria-label={`انتخاب رنگ ${color}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={createCategory}
                  disabled={creatingCat || !newCatName.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="size-3.5" />
                  {creatingCat ? "در حال ساخت..." : "ساخت دسته‌بندی"}
                </button>
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Meta settings */}
      <FormSection
        icon={<Palette className="size-4" />}
        title="جزئیات و حال‌وهوا"
        description="برای اینکه بعداً راحت‌تر برگردی سراغ این نوشته."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {isEdit && (
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <CustomSelect
                  label="نوع"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={TYPE_OPTIONS}
                  error={errors.type?.message}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="mood"
            render={({ field }) => (
              <CustomSelect
                label="حال و هوا"
                value={field.value}
                onValueChange={field.onChange}
                options={MOOD_OPTIONS}
                error={errors.mood?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <CustomSelect
                label="وضعیت"
                value={field.value}
                onValueChange={field.onChange}
                options={STATUS_OPTIONS}
                error={errors.status?.message}
              />
            )}
          />
        </div>
      </FormSection>

      {/* Reminder + pin */}
      <FormSection
        icon={<Bell className="size-4" />}
        title="یادآوری و نگه‌داشتن"
        description="اگر این نوشته مهم است، برایش زمان یا جای ویژه بگذار."
      >
        <div className="space-y-4">
          <Controller
            control={control}
            name="reminderAt"
            render={({ field }) => (
              <JalaliDateTimePicker
                label="یادآور (اختیاری)"
                value={field.value ?? null}
                onChange={(val) => field.onChange(val ?? null)}
                placeholder="زمان یادآوری را انتخاب کن"
                withTime
                clearable
                error={errors.reminderAt?.message}
              />
            )}
          />

          <button
            type="button"
            onClick={() =>
              setValue("isPinned", !isPinned, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border p-4 text-right transition-all duration-200",
              isPinned
                ? "border-primary bg-primary text-white shadow-[0_16px_40px_rgba(138,90,68,0.22)]"
                : "border-border bg-card hover:border-primary-soft hover:bg-background",
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-2xl",
                  isPinned
                    ? "bg-white/15 text-white"
                    : "bg-card-soft text-primary",
                )}
              >
                <Pin className="size-4" />
              </span>

              <span>
                <span
                  className={cn(
                    "block text-sm font-black",
                    isPinned ? "text-white" : "text-foreground",
                  )}
                >
                  پین کردن این نوشته
                </span>
                <span
                  className={cn(
                    "mt-1 block text-xs leading-5",
                    isPinned ? "text-white/75" : "text-muted",
                  )}
                >
                  نوشته‌های پین‌شده همیشه جلوی چشم می‌مانند.
                </span>
              </span>
            </span>

            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border",
                isPinned
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-border bg-background text-muted",
              )}
            >
              {isPinned && <Check className="size-3.5" />}
            </span>
          </button>
        </div>
      </FormSection>

      {/* Submit bar */}
      <div className="sticky bottom-4 z-20">
        <div className="rounded-3xl border border-border bg-card/92 p-3 shadow-[0_20px_70px_rgba(43,37,32,0.14)] backdrop-blur-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 px-1">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
                <Clock3 className="size-4" />
              </span>

              <div>
                <p className="text-xs font-black text-foreground">
                  {isEdit ? "آماده ذخیره تغییرات" : "آماده ساخت نوشته"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  هر وقت حس کردی کافی‌ست، ذخیره‌اش کن.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="min-w-full rounded-2xl font-black sm:min-w-47.5"
            >
              {isSubmitting ? (
                <span key="saving" className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </span>
              ) : (
                <span key="idle" className="inline-flex items-center gap-2">
                  <Save className="size-4" />
                  <span>{isEdit ? "ذخیره تغییرات" : "ذخیره نوشته"}</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-4xl border border-border bg-background/52 p-4 shadow-inner sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary shadow-sm">
          {icon}
        </span>

        <div>
          <h3 className="text-sm font-black text-foreground">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function ErrorText({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-danger">
      <AlertCircle className="size-3.5" />
      {message}
    </p>
  );
}
