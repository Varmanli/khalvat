"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import {
  CalendarClock,
  Check,
  CreditCard,
  Dumbbell,
  Flag,
  FolderPlus,
  Layers3,
  Palette,
  Phone,
  Pin,
  Plus,
  Save,
  SearchCheck,
  Send,
  ShoppingBag,
  Sparkles,
  Text,
  Type,
} from "lucide-react";

import { taskSchema } from "@/lib/validations";
import { persianizeHtmlText } from "@/lib/html-persian-digits";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  TASK_CATEGORY_PALETTE,
} from "@/lib/task-constants";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { JalaliDateTimePicker } from "@/components/ui/jalali-date-time-picker";
import type { TaskCategory } from "@/db/schema";

type FormValues = z.input<typeof taskSchema>;

interface TaskFormProps {
  taskId?: string;
  defaultValues?: Partial<FormValues>;
  categories: TaskCategory[];
}

export function TaskForm({ taskId, defaultValues, categories }: TaskFormProps) {
  const router = useRouter();
  const isEdit = Boolean(taskId);

  const [cats, setCats] = useState<TaskCategory[]>(categories);
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
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      priority: defaultValues?.priority ?? "medium",
      status: defaultValues?.status ?? "todo",
      categoryId: defaultValues?.categoryId ?? "",
      color: defaultValues?.color ?? "",
      dueAt: defaultValues?.dueAt ?? null,
      isPinned: defaultValues?.isPinned ?? false,
    },
  });

  const title = useWatch({ control, name: "title" });
  const isPinned = useWatch({ control, name: "isPinned" });

  async function onSubmit(data: FormValues) {
    const payload = {
      ...data,
      description: data.description ? persianizeHtmlText(data.description) : data.description,
      categoryId: data.categoryId || null,
      color: data.color || null,
      dueAt: data.dueAt || null,
    };

    const url = taskId ? `/api/tasks/${taskId}` : "/api/tasks";
    const method = taskId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.ok) {
      toast.success(isEdit ? "وظیفه ذخیره شد." : "وظیفه جدید ثبت شد.");
      const id = taskId ?? json.data?.id;
      router.push(`/tasks/${id}`);
      router.refresh();
      return;
    }

    toast.error(json.error?.message ?? "خطایی رخ داد.");
  }

  async function createCategory() {
    const name = newCatName.trim();

    if (!name) return;

    setCreatingCat(true);

    try {
      const res = await fetch("/api/task-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color: newCatColor }),
      });

      const json = await res.json();

      if (json.ok) {
        setCats((prev) => [...prev, json.data]);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {!isEdit && (
        <QuickTemplates
          onSelect={(title, priority) => {
            setValue("title", title, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue("priority", priority, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      )}

      <FormSection
        icon={<Type className="size-5" />}
        eyebrow="اصل ماجرا"
        title="وظیفه را واضح بنویس"
        description="همین‌قدر بنویس که وقتی برگشتی، دقیق بدانی باید چه کاری انجام شود."
      >
        <div className="space-y-4">
          <Input
            label="عنوان"
            placeholder="مثلاً: پرداخت قبض، تماس با دکتر، مرتب کردن میز..."
            {...register("title")}
            error={errors.title?.message}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <RichTextEditor
                label="توضیحات اختیاری"
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="اگر جزئیات، لینک، یادآوری ذهنی یا توضیح بیشتری لازم دارد، اینجا بنویس..."
                error={errors.description?.message}
                minHeight={180}
                stickyToolbar
              />
            )}
          />

          <div className="rounded-2xl border border-border bg-background/65 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
                <Text className="size-4" />
              </span>

              <div>
                <p className="text-xs font-black text-foreground">
                  {title?.trim()
                    ? "خوبه؛ عنوان مشخصه."
                    : "یک عنوان کوتاه، شروع را راحت‌تر می‌کند."}
                </p>
                <p className="mt-1 text-xs leading-6 text-muted">
                  وظیفه خوب معمولاً با یک فعل شروع می‌شود: بنویس، بفرست، تماس
                  بگیر، بررسی کن، پرداخت کن.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        icon={<Flag className="size-5" />}
        eyebrow="وضعیت و اهمیت"
        title="اولویت و مرحله انجام"
        description="برای اینکه بعداً راحت‌تر پیدایش کنی، مشخص کن چقدر مهم است و الان در چه وضعیتی قرار دارد."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <CustomSelect
                label="اولویت"
                value={field.value}
                onValueChange={field.onChange}
                options={PRIORITY_OPTIONS}
                error={errors.priority?.message}
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

      <FormSection
        icon={<Layers3 className="size-5" />}
        eyebrow="دسته‌بندی"
        title="جایش را در دفتر مشخص کن"
        description="دسته‌بندی کمک می‌کند وظیفه‌ها بعداً توی شلوغی گم نشوند."
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
                    مثلاً: خانه، کار، خرید، سلامتی، پروژه‌ها
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

      <FormSection
        icon={<CalendarClock className="size-5" />}
        eyebrow="زمان"
        title="اگر موعدی دارد، ثبتش کن"
        description="تاریخ برای فشار آوردن نیست؛ برای این است که لازم نباشد همه چیز را توی ذهنت نگه داری."
      >
        <Controller
          control={control}
          name="dueAt"
          render={({ field }) => (
            <JalaliDateTimePicker
              label="موعد انجام اختیاری"
              value={field.value ?? null}
              onChange={(val) => field.onChange(val ?? null)}
              placeholder="انتخاب تاریخ..."
              withTime
              clearable
              placement="auto"
              error={errors.dueAt?.message}
            />
          )}
        />
      </FormSection>

      <FormSection
        icon={<Palette className="size-5" />}
        eyebrow="ظاهر کارت"
        title="یک رنگ کوچک برای شناخت سریع"
        description="این رنگ روی کارت وظیفه کمک می‌کند کارها با یک نگاه قابل تشخیص باشند."
      >
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {[
                { value: "", color: "var(--border)", label: "پیش‌فرض" },
                ...TASK_CATEGORY_PALETTE.map((color) => ({
                  value: color,
                  color,
                  label: color,
                })),
              ].map((option) => {
                const isActive = (field.value ?? "") === option.value;

                return (
                  <button
                    key={option.value || "default"}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    title={option.label}
                    className={
                      isActive
                        ? "flex size-9 items-center justify-center rounded-full border-2 border-foreground shadow-sm transition-all"
                        : "flex size-9 items-center justify-center rounded-full border-2 border-transparent transition-all hover:scale-110 hover:border-border"
                    }
                    style={{ background: option.color }}
                  >
                    {isActive && (
                      <Check className="size-4 text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        />
      </FormSection>

      <Controller
        control={control}
        name="isPinned"
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
              <Pin className="size-5" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-foreground">
                پین کردن این وظیفه
              </span>
              <span className="mt-1 block text-xs leading-6 text-muted">
                {isPinned
                  ? "این وظیفه بالاتر و دم‌دست‌تر دیده می‌شود."
                  : "اگر مهم است، پینش کن تا بین کارهای دیگر گم نشود."}
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

      <div className="sticky bottom-4 z-10 rounded-3xl border border-border bg-card/88 p-3 shadow-[0_18px_70px_rgba(94,58,47,0.13)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 px-1">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft/45 text-primary-dark">
              <Sparkles className="size-4" />
            </span>

            <div>
              <p className="text-xs font-black text-foreground">
                {isEdit ? "آماده ذخیره تغییرات" : "آماده ثبت در دفتر وظایف"}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                بعد از ذخیره، به صفحه جزئیات همین وظیفه می‌روی.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <Save className="size-4" />
            {isSubmitting
              ? "در حال ذخیره..."
              : isEdit
                ? "ذخیره تغییرات"
                : "ذخیره وظیفه"}
          </Button>
        </div>
      </div>
    </form>
  );
}

type TaskPriority = "low" | "medium" | "high" | "urgent";

const QUICK_TEMPLATES: {
  label: string;
  prefix: string;
  priority: TaskPriority;
  icon: React.ElementType;
}[] = [
  { label: "تماس با...", prefix: "تماس با ", priority: "medium", icon: Phone },
  { label: "پرداخت...", prefix: "پرداخت ", priority: "high", icon: CreditCard },
  { label: "خرید...", prefix: "خرید ", priority: "low", icon: ShoppingBag },
  { label: "بررسی...", prefix: "بررسی ", priority: "medium", icon: SearchCheck },
  { label: "ارسال...", prefix: "ارسال ", priority: "medium", icon: Send },
  { label: "سلامتی / تمرین", prefix: "سلامتی / تمرین", priority: "medium", icon: Dumbbell },
];

function QuickTemplates({
  onSelect,
}: {
  onSelect: (title: string, priority: TaskPriority) => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-background/65 p-4 shadow-inner">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-card-soft text-primary">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="text-xs font-black text-foreground">شروع سریع</p>
          <p className="text-[11px] text-muted">
            یکی را بزن و بعد جزئیاتش را کامل کن.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_TEMPLATES.map(({ label, prefix, priority, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(prefix, priority)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted transition-all duration-150 hover:border-primary-soft hover:bg-primary-soft/25 hover:text-primary-dark active:scale-[0.97]"
          >
            <Icon className="size-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>
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
