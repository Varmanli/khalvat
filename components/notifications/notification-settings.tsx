"use client";

import { Bell, BellOff, CheckCircle2, Smartphone } from "lucide-react";
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
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "مرورگر اجازه‌ی اعلان را نداد. مجوز اعلان‌های خلوت را در تنظیمات مرورگر فعال کن.";
  }
  return "فعال‌سازی اعلان‌ها کامل نشد. اتصال اینترنت و تنظیمات مرورگر را بررسی کن.";
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
    setPrefs(next);
    const response = await fetch("/api/notifications/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!response.ok) {
      toast.error("ذخیره‌ی تنظیمات اعلان انجام نشد.");
      void inspectDevice();
    }
  }

  async function enable() {
    if (deviceState === "needs-install") {
      toast.error("برای اعلان در iPhone و iPad، ابتدا خلوت را از Safari به صفحهٔ اصلی اضافه و از همان اپ باز کن.");
      return;
    }
    if (!window.isSecureContext || !("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return setDeviceState("unsupported");
    }
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return toast.error("کلید عمومی اعلان‌ها در نسخه‌ی نصب‌شده‌ی برنامه موجود نیست.");

    setIsEnabling(true);
    try {
      // This stays directly inside the user's click gesture, required by mobile browsers.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setDeviceState(permission === "denied" ? "denied" : "default");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      await navigator.serviceWorker.ready;
      const subscription = (await registration.pushManager.getSubscription()) ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyToBytes(publicKey),
      });
      const response = await fetch("/api/notifications/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error("Subscription was not saved");

      await save({ ...prefs, enabled: true });
      setDeviceState("subscribed");
      toast.success("اعلان‌ها برای این دستگاه فعال شد.");
    } catch (error) {
      toast.error(errorMessage(error));
      await inspectDevice();
    } finally {
      setIsEnabling(false);
    }
  }

  const deviceCopy: Record<DeviceState, string> = {
    loading: "در حال بررسی وضعیت این دستگاه…",
    subscribed: "مجوز، Service Worker و اشتراک این دستگاه فعال هستند.",
    granted: "مجوز مرورگر داده شده، اما اشتراک اعلان این دستگاه هنوز کامل نشده است.",
    default: "با انتخاب خودت، اجازه‌ی اعلان را از مرورگر می‌گیریم.",
    denied: "اجازه‌ی اعلان در مرورگر غیرفعال است؛ آن را از تنظیمات سایت یا مرورگر فعال کن.",
    "needs-install": "برای اعلان در iPhone و iPad، ابتدا سایت را از Safari به صفحهٔ اصلی اضافه و از همان اپ باز کن.",
    unsupported: "این مرورگر یا اتصال فعلی از اعلان‌های Push پشتیبانی نمی‌کند.",
  };
  const canEnable = deviceState === "default" || deviceState === "granted";
  const toggle = (key: string, label: string) => (
    <label className="flex items-center justify-between rounded-2xl border border-border bg-background/65 px-4 py-3">
      <span className="text-sm font-bold text-foreground">{label}</span>
      <input aria-label={label} type="checkbox" checked={Boolean(prefs[key])} onChange={(event) => void save({ ...prefs, [key]: event.target.checked })} className="size-5 accent-primary" />
    </label>
  );

  return (
    <section className="rounded-[2.35rem] border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,.06)] sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Bell className="size-5" /></span>
        <div><h1 className="text-2xl font-black">اعلان‌های خلوت</h1><p className="mt-1 text-sm leading-7 text-muted">خلوت فقط سر وقت چیزهای مهم را یادت می‌اندازد.</p></div>
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-background/65 p-4">
        <div className="flex items-start justify-between gap-3">
          <div><p className="font-black">اعلان این دستگاه</p><p className="mt-1 max-w-xl text-xs leading-6 text-muted">{deviceCopy[deviceState]}</p></div>
          {deviceState === "subscribed" ? <CheckCircle2 className="shrink-0 text-olive" /> : deviceState === "denied" || deviceState === "unsupported" || deviceState === "needs-install" ? <BellOff className="shrink-0 text-muted" /> : <Smartphone className="shrink-0 text-primary" />}
        </div>
        {canEnable && <button type="button" disabled={isEnabling} onClick={() => void enable()} className="mt-4 rounded-2xl bg-primary px-4 py-2.5 text-xs font-black text-white disabled:cursor-wait disabled:opacity-60">{isEnabling ? "در حال فعال‌سازی…" : deviceState === "granted" ? "تکمیل فعال‌سازی اعلان‌ها" : "فعال کردن اعلان‌ها"}</button>}
      </div>
      <div className="mt-5 space-y-3">
        {toggle("enabled", "اعلان‌های خلوت")}
        {toggle("moodEnabled", "حال‌نگار")}
        {toggle("gratitudeEnabled", "شکرگزاری")}
        {toggle("habitsEnabled", "عادت‌ها")}
        {toggle("tasksEnabled", "وظایف زمان‌دار")}
        {toggle("eventsEnabled", "رویدادها")}
      </div>
    </section>
  );
}
