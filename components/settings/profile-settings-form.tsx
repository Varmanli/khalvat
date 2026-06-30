"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  AtSign,
  BadgeCheck,
  Mail,
  Palette,
  Save,
  Sparkles,
  User,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { AvatarColorPicker } from "@/components/avatar/avatar-color-picker";
import { AvatarIconPicker } from "@/components/avatar/avatar-icon-picker";
import { UserAvatar } from "@/components/avatar/user-avatar";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations";

interface ProfileSettingsFormProps {
  initialName: string;
  initialBio?: string | null;
  initialAvatarIcon?: string | null;
  initialAvatarColor?: string | null;
  email: string;
}

export function ProfileSettingsForm({
  initialName,
  initialBio,
  initialAvatarIcon,
  initialAvatarColor,
  email,
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialName,
      bio: initialBio ?? "",
      avatarIcon: initialAvatarIcon ?? "leaf",
      avatarColor: initialAvatarColor ?? "#8A5A44",
    },
  });

  const avatarIcon = watch("avatarIcon");
  const avatarColor = watch("avatarColor");
  const name = watch("name");
  const bio = watch("bio");

  async function onSubmit(data: UpdateProfileInput) {
    setSaving(true);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          bio: data.bio?.trim() || null,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
        return;
      }

      toast.success("پروفایل با موفقیت ذخیره شد.");
      router.refresh();
    } catch {
      toast.error("خطایی رخ داد. دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <section className="relative overflow-hidden rounded-[1.9rem] border border-border bg-card shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/14" />
        <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-gold/12 blur-3xl" />

        <div className="relative p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <UserAvatar
                icon={avatarIcon}
                color={avatarColor}
                name={name}
                size="lg"
              />

              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
                  <Sparkles className="size-3.5 text-gold" />
                  پیش‌نمایش پروفایل
                </div>

                <h3 className="truncate text-lg font-black text-foreground">
                  {name?.trim() || "نام شما"}
                </h3>

                <p className="mt-1 truncate text-xs text-muted">{email}</p>

                <p className="mt-2 line-clamp-2 max-w-md text-sm leading-7 text-muted">
                  {bio?.trim() ||
                    "یک بیوگرافی کوتاه می‌تواند خلوت را شخصی‌تر کند."}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/70 px-4 py-3 sm:min-w-36">
              <p className="text-[11px] font-bold text-muted">وضعیت</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-black text-foreground">
                <BadgeCheck className="size-4 text-primary" />
                {isDirty ? "تغییر داده شده" : "ذخیره‌شده"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <FormSection
        icon={<User className="size-5" />}
        eyebrow="اطلاعات پایه"
        title="نام و معرفی کوتاه"
        description="این‌ها چیزهایی هستند که خلوت با آن‌ها تو را می‌شناسد."
      >
        <div className="grid gap-4">
          <Field>
            <label className="mb-1.5 block text-sm font-black text-foreground">
              نام نمایشی
            </label>

            <div className="relative">
              <User className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />

              <input
                {...register("name")}
                className="h-12 w-full rounded-2xl border border-border bg-background/70 px-4 pr-11 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
                placeholder="نام شما"
                dir="rtl"
              />
            </div>

            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <label className="mb-1.5 block text-sm font-black text-foreground">
              بیوگرافی کوتاه
              <span className="mr-1 text-xs font-normal text-muted">
                (اختیاری)
              </span>
            </label>

            <textarea
              {...register("bio")}
              rows={3}
              className="w-full resize-none rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-bold leading-7 text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
              placeholder="چند کلمه درباره خودت..."
              dir="rtl"
            />

            <p className="mt-1.5 text-xs leading-5 text-muted">
              کوتاه و خودمونی؛ فقط برای اینکه فضای حساب شخصی‌تر باشد.
            </p>

            {errors.bio && <FieldError>{errors.bio.message}</FieldError>}
          </Field>

          <Field>
            <label className="mb-1.5 block text-sm font-black text-foreground">
              ایمیل
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />

              <input
                value={email}
                disabled
                className="h-12 w-full rounded-2xl border border-border bg-card-soft px-4 pr-11 text-sm font-bold text-muted outline-none"
                dir="ltr"
              />
            </div>

            <p className="mt-1.5 flex items-center gap-1.5 text-xs leading-5 text-muted">
              <AtSign className="size-3.5" />
              ایمیل فعلاً فقط برای ورود و شناسایی حساب استفاده می‌شود.
            </p>
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={<WandSparkles className="size-5" />}
        eyebrow="آواتار"
        title="آیکونی که شبیه حال‌وهوای توست"
        description="چون خلوت آپلود عکس ندارد، از بین آیکون‌های آماده یکی را انتخاب کن."
      >
        <div>
          <div className="mb-4 flex items-center gap-3 rounded-3xl border border-border bg-background/65 p-4">
            <UserAvatar
              icon={avatarIcon}
              color={avatarColor}
              name={name}
              size="md"
            />

            <div>
              <p className="text-sm font-black text-foreground">
                آواتار انتخابی تو
              </p>
              <p className="mt-1 text-xs leading-6 text-muted">
                همین آیکون در هدر، منوها و بخش‌های حساب نمایش داده می‌شود.
              </p>
            </div>
          </div>

          <AvatarIconPicker
            value={avatarIcon}
            color={avatarColor}
            onChange={(key) =>
              setValue("avatarIcon", key, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />

          {errors.avatarIcon && (
            <FieldError>{errors.avatarIcon.message}</FieldError>
          )}
        </div>
      </FormSection>

      <FormSection
        icon={<Palette className="size-5" />}
        eyebrow="رنگ"
        title="یک رنگ برای فضای شخصی‌ات"
        description="این رنگ کنار آواتار تو دیده می‌شود و حس پروفایلت را مشخص می‌کند."
      >
        <AvatarColorPicker
          value={avatarColor}
          onChange={(color) =>
            setValue("avatarColor", color, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        {errors.avatarColor && (
          <FieldError>{errors.avatarColor.message}</FieldError>
        )}
      </FormSection>

      <div className="sticky bottom-4 z-10 rounded-3xl border border-border bg-card/88 p-3 shadow-[0_18px_70px_rgba(94,58,47,0.13)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 px-1">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft/45 text-primary-dark">
              <Sparkles className="size-4" />
            </span>

            <div>
              <p className="text-xs font-black text-foreground">
                {isDirty ? "تغییرات آماده ذخیره است" : "پروفایل ذخیره‌شده است"}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                بعد از ذخیره، آواتار و نامت در هدر هم به‌روزرسانی می‌شود.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save className="size-4" />
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-visible rounded-[1.75rem] border border-border bg-card/72 p-4 shadow-[0_14px_50px_rgba(94,58,47,0.04)] sm:p-5">
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

function Field({ children }: { children: ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs font-bold text-danger">{children}</p>;
}
