"use client";

import type { LucideIcon } from "lucide-react";
import { Bell, BellOff, BellRing, CalendarDays, Check, CheckCircle2, Heart, ListTodo, Repeat2, Smartphone, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Prefs = Record<string, boolean | string | number | null>;
type DeviceState = "loading" | "unsupported" | "needs-install" | "default" | "denied" | "granted" | "subscribed";

function keyToBytes(value: string) {
  const pad = "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob((value + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function isAppleMobile() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function errorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") return "اجازه‌ی اعلان در مرورگر داده نشد.";
  return "فعال‌سازی کامل نشد؛ از اتصال اینترنت و تنظیمات مرورگر مطمئن شو.";
}

function ToggleCard({ icon: Icon, title, active, onChange, tone }: { icon: LucideIcon; title: string; active: boolean; onChange: (value: boolean) => void; tone: "primary" | "olive" | "gold" | "rose" | "slate" }) {
  const tones = {
    primary: "bg-primary-soft/55 text-primary",
    olive: "bg-olive/12 text-olive",
    gold: "bg-gold/15 text-primary-dark",
    rose: "bg-rose/12 text-rose",
    slate: "bg-card-soft text-muted",
  };
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-[1.35rem] border border-border bg-background/55 p-3 transition-all hover:-translate-y-0.5 hover:border-primary-soft hover:bg-card hover:shadow-[0_12px_28px_rgba(94,58,47,.07)]">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="size-4.5" /></span>
      <span className="min-w-0 flex-1 text-sm font-black text-foreground">{title}</span>
      <input type="checkbox" checked={active} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" aria-label={`${title}: ${active ? "روشن" : "خاموش"}`} />
      <span className="flex h-6 w-11 items-center rounded-full bg-border p-0.5 transition-colors peer-checked:bg-primary"><span className="size-5 rounded-full bg-card shadow-sm transition-transform peer-checked:translate-x-5" /></span>
    </label>
  );
}

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<Prefs>({});
  const [deviceState, setDeviceState] = useState<DeviceState>("loading");
  const [isEnabling, setIsEnabling] = useState(false);

  const inspectDevice = useCallback(async () => {
    try {
      if (!window.isSecureContext || !("serviceWorker" in navigator)) return setDeviceState("unsupported");
      if (isAppleMobile() && !isStandalone()) return setDeviceState("needs-install");
      if (!("Notification" in window) || !("PushManager" in window)) return setDeviceState("unsupported");
      if (Notification.permission === "denied") return setDeviceState("denied");
      if (Notification.permission !== "granted") return setDeviceState("default");
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = registration ? await registration.pushManager.getSubscription() : null;
      setDeviceState(subscription ? "subscribed" : "granted");
    } catch {
      setDeviceState("unsupported");
    }
  }, []);

  useEffect(() => {
    void Promise.all([
      fetch("/api/notifications/preferences").then((response) => response.json()).then((result) => setPrefs(result.data ?? {})),
      inspectDevice(),
    ]);
  }, [inspectDevice]);

  async function save(next: Prefs) {
    const previous = prefs;
    setPrefs(next);
    const response = await fetch("/api/notifications/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!response.ok) {
      setPrefs(previous);
      toast.error("تنظیمات ذخیره نشد. دوباره امتحان کن.");
    }
  }

  async function enable() {
    if (deviceState === "needs-install") return toast.error("در iPhone و iPad، ابتدا خلوت را از Safari به صفحهٔ اصلی اضافه کن.");
    if (!window.isSecureContext || !("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return setDeviceState("unsupported");
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return toast.error("کلید عمومی اعلان‌ها در این نسخه موجود نیست.");

    setIsEnabling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setDeviceState(permission === "denied" ? "denied" : "default");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      await navigator.serviceWorker.ready;
      const subscription = (await registration.pushManager.getSubscription()) ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey) });
      const response = await fetch("/api/notifications/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription) });
      if (!response.ok) throw new Error("Subscription was not saved");
      await save({ ...prefs, enabled: true });
      setDeviceState("subscribed");
      toast.success("اعلان‌های این دستگاه فعال شد.");
    } catch (error) {
      toast.error(errorMessage(error));
      await inspectDevice();
    } finally {
      setIsEnabling(false);
    }
  }

  const state = {
    loading: { title: "در حال بررسی دستگاه", note: "", icon: Smartphone, tone: "bg-card-soft text-muted" },
    subscribed: { title: "اعلان‌های این دستگاه فعال است", note: "", icon: CheckCircle2, tone: "bg-olive/12 text-olive" },
    granted: { title: "فعال‌سازی اعلان را کامل کن", note: "", icon: BellRing, tone: "bg-gold/15 text-primary-dark" },
    default: { title: "اعلان‌های این دستگاه خاموش است", note: "", icon: BellOff, tone: "bg-card-soft text-muted" },
    denied: { title: "اجازه‌ی اعلان در مرورگر بسته است", note: "", icon: BellOff, tone: "bg-rose/12 text-rose" },
    "needs-install": { title: "ابتدا خلوت را نصب کن", note: "", icon: Smartphone, tone: "bg-gold/15 text-primary-dark" },
    unsupported: { title: "اعلان در این دستگاه پشتیبانی نمی‌شود", note: "", icon: BellOff, tone: "bg-card-soft text-muted" },
  }[deviceState];
  const DeviceIcon = state.icon;
  const canEnable = deviceState === "default" || deviceState === "granted";
  const updateToggle = (key: string, value: boolean) => void save({ ...prefs, [key]: value });

  return (
    <section className="overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_20px_70px_rgba(94,58,47,.07)]">
      <div className="relative overflow-hidden border-b border-border bg-linear-to-bl from-card via-background to-primary-soft/30 px-5 py-6 sm:px-7">
        <div className="pointer-events-none absolute -left-12 -top-14 size-44 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_28px_rgba(138,90,68,.24)]"><Bell className="size-5" /></span>
          <div><p className="text-xs font-black text-primary">فضای شخصی تو</p><h1 className="mt-1 text-2xl font-black text-foreground">اعلان‌ها</h1></div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <div className="flex items-center gap-3 rounded-[1.45rem] border border-border bg-background/65 p-3.5">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${state.tone}`}><DeviceIcon className="size-5" /></span>
          <p className="min-w-0 flex-1 text-sm font-black text-foreground">{state.title}</p>
          {canEnable && <button type="button" disabled={isEnabling} onClick={() => void enable()} className="rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60">{isEnabling ? "…" : deviceState === "granted" ? "تکمیل" : "فعال‌سازی"}</button>}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-foreground">وضعیت کلی</h2><span className={`inline-flex items-center gap-1.5 text-xs font-black ${prefs.enabled === false ? "text-muted" : "text-olive"}`}><span className={`size-1.5 rounded-full ${prefs.enabled === false ? "bg-muted" : "bg-olive"}`} />{prefs.enabled === false ? "خاموش" : "روشن"}</span></div>
          <ToggleCard icon={BellRing} title="اعلان‌های خلوت" active={prefs.enabled !== false} onChange={(value) => updateToggle("enabled", value)} tone="primary" />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2"><Sparkles className="size-4 text-primary" /><h2 className="text-sm font-black text-foreground">چه چیزهایی یادآوری شوند؟</h2></div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <ToggleCard icon={Repeat2} title="عادت‌ها" active={prefs.habitsEnabled !== false} onChange={(value) => updateToggle("habitsEnabled", value)} tone="olive" />
            <ToggleCard icon={ListTodo} title="وظایف زمان‌دار" active={prefs.tasksEnabled !== false} onChange={(value) => updateToggle("tasksEnabled", value)} tone="primary" />
            <ToggleCard icon={CalendarDays} title="رویدادها" active={prefs.eventsEnabled !== false} onChange={(value) => updateToggle("eventsEnabled", value)} tone="gold" />
            <ToggleCard icon={Bell} title="یادآور نوشته‌ها" active={prefs.manualEnabled !== false} onChange={(value) => updateToggle("manualEnabled", value)} tone="rose" />
            <ToggleCard icon={Heart} title="حال‌نگار" active={prefs.moodEnabled !== false} onChange={(value) => updateToggle("moodEnabled", value)} tone="rose" />
            <ToggleCard icon={Check} title="شکرگزاری" active={prefs.gratitudeEnabled !== false} onChange={(value) => updateToggle("gratitudeEnabled", value)} tone="gold" />
          </div>
        </div>
      </div>
    </section>
  );
}
