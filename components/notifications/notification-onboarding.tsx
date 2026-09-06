"use client";

import { Bell, BellRing, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

function keyToBytes(value: string) {
  const pad = "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob((value + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function supportsPushOnThisDevice() {
  const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.isSecureContext && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window && (!isAppleMobile || standalone);
}

export function NotificationOnboarding() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  async function markSeen() {
    await fetch("/api/notifications/onboarding", { method: "POST" });
  }

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!supportsPushOnThisDevice() || Notification.permission === "denied") return;
      try {
        const response = await fetch("/api/notifications/onboarding", { cache: "no-store" });
        const result = await response.json();
        if (cancelled || !result.ok || !result.data?.shouldPrompt) return;
        if (Notification.permission === "granted") {
          await markSeen();
          return;
        }
        setVisible(true);
      } catch {
        // The prompt is optional and must never interrupt the workspace.
      }
    }
    void check();
    return () => { cancelled = true; };
  }, [pathname]);

  async function decline() {
    setVisible(false);
    await markSeen();
  }

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      toast.error("کلید اعلان‌ها در این نسخه از برنامه تنظیم نشده است.");
      await decline();
      return;
    }

    setSaving(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.message("هر زمان خواستی می‌توانی اعلان‌ها را از تنظیمات فعال کنی.");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      await navigator.serviceWorker.ready;
      const subscription = (await registration.pushManager.getSubscription()) ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyToBytes(publicKey),
      });
      const subscriptionResponse = await fetch("/api/notifications/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!subscriptionResponse.ok) throw new Error("Subscription was not saved");
      await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true }),
      });
      toast.success("اعلان‌ها فعال شدند؛ زمان عادت‌ها و کارها را یادت می‌اندازیم.");
    } catch {
      toast.error("فعال‌سازی کامل نشد؛ می‌توانی بعداً از تنظیمات دوباره امتحان کنی.");
    } finally {
      await markSeen();
      setSaving(false);
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end bg-foreground/25 p-4 backdrop-blur-[2px] sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="notification-onboarding-title">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_90px_rgba(52,32,24,.22)]">
        <div className="bg-linear-to-br from-card via-background to-primary-soft/30 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_30px_rgba(138,90,68,.24)]"><BellRing className="size-5" /></span>
            <button type="button" onClick={() => void decline()} aria-label="فعلاً نه" className="flex size-9 items-center justify-center rounded-xl border border-border bg-card/80 text-muted"><X className="size-4" /></button>
          </div>
          <h2 id="notification-onboarding-title" className="mt-5 text-xl font-black text-foreground">دوست داری یادآوری‌ها را دریافت کنی؟</h2>
          <p className="mt-2 text-sm leading-7 text-muted">برای عادت‌ها، کارهای زمان‌دار و رویدادها فقط همان موقعی که لازم داری اعلان می‌فرستیم.</p>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card/70 p-3.5">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 size-5 accent-primary" />
            <span><span className="block text-sm font-black text-foreground">اعلان‌های خلوت را فعال می‌کنم</span><span className="mt-1 block text-xs leading-6 text-muted">هر زمان خواستی از تنظیمات می‌توانی آن‌ها را خاموش کنی.</span></span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
          <button type="button" disabled={saving} onClick={() => void decline()} className="rounded-2xl px-4 py-2.5 text-xs font-black text-muted disabled:opacity-60">فعلاً نه</button>
          <button type="button" disabled={!accepted || saving} onClick={() => void enable()} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><Bell className="size-3.5" />{saving ? "در حال فعال‌سازی…" : "فعال‌سازی"}</button>
        </div>
      </div>
    </div>
  );
}
