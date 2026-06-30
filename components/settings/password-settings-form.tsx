"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validations";

interface PasswordSettingsFormProps {
  hasPassword: boolean;
}

export function PasswordSettingsForm({ hasPassword }: PasswordSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  });

  if (!hasPassword) {
    return (
      <div className="rounded-2xl bg-background/70 px-5 py-4 text-sm text-muted">
        حساب شما با گوگل ایجاد شده است و رمز عبور مستقیم ندارد. می‌توانید از طریق گوگل وارد شوید.
      </div>
    );
  }

  async function onSubmit(data: UpdatePasswordInput) {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
      } else {
        toast.success("رمز عبور با موفقیت تغییر کرد.");
        reset();
      }
    } catch {
      toast.error("خطایی رخ داد. دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }

  function PasswordField({
    label,
    name,
    show,
    toggle,
    error,
  }: {
    label: string;
    name: keyof UpdatePasswordInput;
    show: boolean;
    toggle: () => void;
    error?: string;
  }) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">
          {label}
        </label>
        <div className="relative">
          <input
            {...register(name)}
            type={show ? "text" : "password"}
            dir="ltr"
            className="h-11 w-full rounded-2xl border border-border bg-background/70 px-4 pl-11 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
          />
          <button
            type="button"
            onClick={toggle}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <PasswordField
        label="رمز عبور فعلی"
        name="currentPassword"
        show={showCurrent}
        toggle={() => setShowCurrent((v) => !v)}
        error={errors.currentPassword?.message}
      />
      <PasswordField
        label="رمز عبور جدید"
        name="newPassword"
        show={showNew}
        toggle={() => setShowNew((v) => !v)}
        error={errors.newPassword?.message}
      />
      <PasswordField
        label="تکرار رمز عبور جدید"
        name="confirmPassword"
        show={showConfirm}
        toggle={() => setShowConfirm((v) => !v)}
        error={errors.confirmPassword?.message}
      />

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(138,90,68,0.28)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark disabled:opacity-60"
      >
        {saving ? "در حال تغییر..." : "تغییر رمز عبور"}
      </button>
    </form>
  );
}
