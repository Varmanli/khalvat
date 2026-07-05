import { z } from "zod";
import { htmlToPlainText } from "@/lib/html-utils";
import { USER_AVATAR_ICONS, USER_AVATAR_COLORS } from "@/lib/avatar-options";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .max(100, "رمز عبور نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
});

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const entrySchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الزامی است")
    .max(255, "عنوان نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد"),
  content: z
    .string()
    .refine((v) => htmlToPlainText(v).length > 0, {
      message: "محتوا الزامی است",
    }),
  type: z.enum(["note", "idea", "poem", "watch", "read", "reminder", "spark"]),
  mood: z.enum([
    "calm",
    "sad",
    "excited",
    "nostalgic",
    "dark",
    "hopeful",
    "romantic",
    "tired",
    "neutral",
  ]),
  status: z.enum(["raw", "active", "done", "archived", "dropped"]),
  isPinned: z.boolean().optional().default(false),
  reminderAt: z.string().optional().nullable(),
  /** Comma-separated tag names, e.g. "ایده, شعر" or "#ایده #شعر" */
  tags: z.string().optional().default(""),
  categoryId: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .nullable(),
});

export const entryCategorySchema = z.object({
  name: z
    .string()
    .min(1, "نام دسته‌بندی الزامی است")
    .max(40, "نام نمی‌تواند بیشتر از ۴۰ کاراکتر باشد"),
  color: z.string().optional().default("#8A5A44"),
  icon: z.string().optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EntryInput = z.infer<typeof entrySchema>;
export type EntryCategoryInput = z.infer<typeof entryCategorySchema>;

// ── Task schemas ──────────────────────────────────────────────────

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الزامی است")
    .max(255, "عنوان نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد"),
  description: z
    .string()
    .optional()
    .nullable()
    .refine((value) => htmlToPlainText(value ?? "").length <= 2000, {
      message: "توضیحات وظیفه نباید بیشتر از ۲٬۰۰۰ کاراکتر باشد.",
    }),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["todo", "in_progress", "done", "archived"]).default("todo"),
  categoryId: z.string().uuid().optional().nullable(),
  color: z.string().optional().nullable(),
  dueAt: z.string().optional().nullable(),
  isPinned: z.boolean().optional().default(false),
});

export const taskCategorySchema = z.object({
  name: z
    .string()
    .min(1, "نام دسته‌بندی الزامی است")
    .max(100, "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
  color: z.string().optional().default("#8A5A44"),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskCategoryInput = z.infer<typeof taskCategorySchema>;

// ── Gratitude schemas ─────────────────────────────────────────────

export const gratitudeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست"),
  items: z
    .array(
      z.string()
        .trim()
        .min(2, "هر مورد باید کوتاه و خوانا باشد")
        .max(240, "هر مورد باید کوتاه و خوانا باشد")
    )
    .min(1, "حداقل یک مورد برای شکرگزاری بنویس")
    .max(5, "حداکثر ۵ مورد می‌توانی بنویسی"),
  note: z.string().max(1000, "یادداشت طولانی است").optional().nullable(),
  mood: z.string().optional().nullable(),
});

export type GratitudeInput = z.infer<typeof gratitudeSchema>;

// ── Daily check-in schemas ──────────────────────────────────────

const DAILY_CHECK_IN_EMOJI_BY_MOOD = {
  great: "😄",
  good: "🙂",
  normal: "😐",
  hard: "😔",
  bad: "😡",
  tired: "😴",
} as const;

export const dailyCheckInSchema = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست"),
  mood: z.enum(["great", "good", "normal", "hard", "bad", "tired"]),
  emoji: z.string().min(1, "انتخاب حال الزامی است").max(8, "ایموجی معتبر نیست"),
  note: z.string().max(1000, "یادداشت نباید بیشتر از ۱۰۰۰ کاراکتر باشد").optional().nullable(),
}).superRefine((data, ctx) => {
  if (DAILY_CHECK_IN_EMOJI_BY_MOOD[data.mood] !== data.emoji) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["emoji"],
      message: "ایموجی انتخاب‌شده با حال روز هماهنگ نیست.",
    });
  }
});

export type DailyCheckInInput = z.infer<typeof dailyCheckInSchema>;

// ── Habit schemas ─────────────────────────────────────────────

export const habitSchema = z
  .object({
    title: z
      .string()
      .min(1, "عنوان الزامی است")
      .max(120, "عنوان نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد"),
    shortDescription: z.string().max(280, "توضیح نمی‌تواند بیشتر از ۲۸۰ کاراکتر باشد").optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    color: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    dailyGoal: z.coerce.number().positive("هدف روزانه باید عدد مثبت باشد").optional().nullable(),
    unit: z.string().max(32, "واحد نمی‌تواند بیشتر از ۳۲ کاراکتر باشد").optional().nullable(),
    reminderTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "فرمت زمان باید HH:mm باشد")
      .optional()
      .nullable(),
    isActive: z.boolean().optional().default(true),
    repeatType: z.enum(["daily", "weekly"]).default("daily"),
    weeklyDays: z.array(z.number().int().min(0).max(6)).optional().default([]),
    durationDays: z.coerce.number().int().positive("مدت زمان باید عدد مثبت باشد").optional().nullable(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست").optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.repeatType === "weekly" && (!data.weeklyDays || data.weeklyDays.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "حداقل یک روز هفته را انتخاب کن.",
        path: ["weeklyDays"],
      });
    }
  });

export const habitLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست"),
  status: z.enum(["done", "skipped"]),
  value: z.coerce.number().optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export const habitCategorySchema = z.object({
  name: z
    .string()
    .min(1, "نام دسته‌بندی الزامی است")
    .max(100, "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
  color: z.string().optional().default("#8A5A44"),
  icon: z.string().optional().nullable(),
});

export type HabitInput = z.infer<typeof habitSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
export type HabitCategoryInput = z.infer<typeof habitCategorySchema>;

// ── Settings schemas ──────────────────────────────────────────────

const AVATAR_ICON_KEYS = USER_AVATAR_ICONS.map((o) => o.key);
const AVATAR_COLOR_VALUES = USER_AVATAR_COLORS as string[];

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "نام الزامی است")
    .max(80, "نام نمی‌تواند بیشتر از ۸۰ کاراکتر باشد"),
  bio: z
    .string()
    .max(280, "بیوگرافی نمی‌تواند بیشتر از ۲۸۰ کاراکتر باشد")
    .optional()
    .nullable(),
  avatarIcon: z
    .string()
    .refine((v) => AVATAR_ICON_KEYS.includes(v), {
      message: "آیکون انتخاب‌شده معتبر نیست.",
    }),
  avatarColor: z
    .string()
    .refine(
      (v) => AVATAR_COLOR_VALUES.includes(v) || /^#[0-9A-Fa-f]{6}$/.test(v),
      { message: "رنگ انتخاب‌شده معتبر نیست." }
    ),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
    newPassword: z
      .string()
      .min(8, "رمز عبور جدید باید حداقل ۸ کاراکتر باشد"),
    confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "رمز عبور جدید و تکرار آن یکسان نیستند.",
    path: ["confirmPassword"],
  });

export const updatePreferencesSchema = z.object({
  defaultHome: z.enum(["dashboard", "entries", "tasks", "gratitude", "habits"]),
  showDailyVerse: z.boolean(),
  showGuideCards: z.boolean(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

// ── Account deletion schema ───────────────────────────────────────

export const deleteAccountSchema = z.object({
  confirmationPhrase: z.string().min(1, "عبارت تأیید الزامی است"),
  currentPassword: z.string().optional(),
  emailConfirmation: z.string().optional(),
});
