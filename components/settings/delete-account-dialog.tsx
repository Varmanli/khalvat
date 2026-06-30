"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PHRASE = "حذف حساب";

interface DeleteAccountDialogProps {
  hasPassword: boolean;
  userEmail: string;
  isAdmin?: boolean;
}

export function DeleteAccountDialog({
  hasPassword,
  userEmail,
  isAdmin,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const phraseInputRef = useRef<HTMLInputElement>(null);

  // Focus phrase input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => phraseInputRef.current?.focus(), 50);
    } else {
      setPhrase("");
      setPassword("");
      setEmailConfirm("");
      setShowPassword(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const phraseOk = phrase === PHRASE;
  const credentialOk = hasPassword
    ? password.length > 0
    : emailConfirm.trim().toLowerCase() === userEmail.toLowerCase();
  const canSubmit = phraseOk && credentialOk && !deleting;

  async function handleDelete() {
    if (!canSubmit) return;
    setDeleting(true);
    try {
      const body: Record<string, string> = { confirmationPhrase: phrase };
      if (hasPassword) body.currentPassword = password;
      else body.emailConfirmation = emailConfirm;

      const res = await fetch("/api/settings/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
        return;
      }

      toast.success("حساب شما حذف شد.");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("خطایی رخ داد. دوباره تلاش کن.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-danger/30 bg-danger/8 px-5 py-3 text-sm font-bold text-danger transition-all hover:border-danger/60 hover:bg-danger/14"
      >
        <Trash2 className="size-4" />
        حذف حساب من
      </button>

      {/* Modal */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Dialog card */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_40px_120px_rgba(0,0,0,0.28)]">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-border bg-danger/8 px-6 py-5">
              <div className="pointer-events-none absolute -left-8 -top-8 size-28 rounded-full bg-danger/10 blur-3xl" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-danger/12 text-danger">
                    <AlertTriangle className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      حذف حساب
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                      این عمل برگشت‌پذیر نیست
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-8 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-card-soft"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
              {/* Warning */}
              <div className="rounded-2xl border border-danger/20 bg-danger/6 px-4 py-3.5 text-sm leading-7 text-foreground">
                با حذف حساب، تمام داده‌های شخصی‌ات از خلوت پاک می‌شود:
                نوشته‌ها، وظایف، شکرگزاری‌ها، عادت‌ها و تنظیمات. امکان
                بازگردانی آن‌ها وجود ندارد.
              </div>

              {isAdmin && (
                <div className="rounded-2xl border border-gold/30 bg-gold/8 px-4 py-3 text-xs text-muted">
                  چون مدیر سیستم هستی، با حذف حساب دسترسی مدیریت هم حذف
                  می‌شود.
                </div>
              )}

              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-xs text-muted">
                اگر لازم است چیزی را نگه داری، قبل از حذف حساب آن را دستی
                ذخیره کن.
              </div>

              {/* Step 1: Phrase */}
              <div>
                <label className="mb-1.5 block text-sm font-black text-foreground">
                  برای تأیید، عبارت زیر را تایپ کن:
                </label>
                <p className="mb-2 select-none rounded-xl border border-dashed border-danger/40 bg-danger/5 px-3 py-2 text-center font-black tracking-wide text-danger">
                  {PHRASE}
                </p>
                <input
                  ref={phraseInputRef}
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  dir="rtl"
                  placeholder="عبارت بالا را اینجا بنویس"
                  className={cn(
                    "h-11 w-full rounded-2xl border px-4 text-sm font-bold outline-none transition-all",
                    phraseOk
                      ? "border-success bg-success/8 text-foreground"
                      : "border-border bg-background/70 text-foreground placeholder:text-muted focus:border-danger/50 focus:ring-4 focus:ring-danger/10"
                  )}
                />
              </div>

              {/* Step 2: Password or email */}
              {hasPassword ? (
                <div>
                  <label className="mb-1.5 block text-sm font-black text-foreground">
                    رمز عبور فعلی
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                      placeholder="رمز عبور حساب"
                      className="h-11 w-full rounded-2xl border border-border bg-background/70 px-4 pl-11 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted focus:border-danger/50 focus:ring-4 focus:ring-danger/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-black text-foreground">
                    ایمیل حساب را تأیید کن
                  </label>
                  <input
                    type="email"
                    value={emailConfirm}
                    onChange={(e) => setEmailConfirm(e.target.value)}
                    dir="ltr"
                    placeholder={userEmail}
                    className="h-11 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-danger/50 focus:ring-4 focus:ring-danger/10"
                  />
                  <p className="mt-1.5 text-xs text-muted">
                    چون حساب شما با گوگل ایجاد شده، ایمیل را به جای رمز عبور
                    تأیید کن.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card-soft"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-2xl bg-danger px-5 py-2.5 text-sm font-black text-white shadow-[0_8px_28px_rgba(185,74,72,0.32)] transition-all hover:-translate-y-0.5 hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
              >
                <Trash2 className="size-4" />
                {deleting ? "در حال حذف..." : "برای همیشه حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
