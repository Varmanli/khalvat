"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, WifiOff, X } from "lucide-react";

const DISMISS_KEY = "khalvat:pwa-install-dismissed-at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function wasDismissedRecently() {
  if (typeof window === "undefined") return false;

  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;

  const timestamp = Number(raw);
  if (!Number.isFinite(timestamp)) return false;

  return Date.now() - timestamp < DISMISS_TTL_MS;
}

function dismissInstallPrompt() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

export function PwaBootstrap() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Ignore registration failures in the UI.
      }
    };

    if (document.readyState === "complete") {
      void register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  useEffect(() => {
    const updateOnline = () => setOnline(window.navigator.onLine);

    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const nextEvent = event as BeforeInstallPromptEvent;
      nextEvent.preventDefault();

      if (isStandaloneMode() || wasDismissedRecently()) {
        return;
      }

      setInstallEvent(nextEvent);
      setPromptVisible(true);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setPromptVisible(false);
      window.localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const hideInstallPrompt = useMemo(
    () => pathname === "/offline" || isStandaloneMode(),
    [pathname],
  );

  async function handleInstall() {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setPromptVisible(false);
      setInstallEvent(null);
      return;
    }

    dismissInstallPrompt();
    setPromptVisible(false);
    setInstallEvent(null);
  }

  function handleDismiss() {
    dismissInstallPrompt();
    setPromptVisible(false);
    setInstallEvent(null);
  }

  return (
    <>
      {!online && pathname !== "/offline" ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] sm:inset-x-auto sm:left-4 sm:max-w-sm">
          <div className="pointer-events-auto rounded-[1.6rem] border border-border bg-card px-4 py-3 shadow-[0_18px_50px_rgba(94,58,47,0.14)]">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
                <WifiOff className="size-4.5" />
              </span>
              <div>
                <p className="text-sm font-black text-foreground">اتصال اینترنت قطع است</p>
                <p className="mt-1 text-xs leading-6 text-muted">
                  برخی بخش‌های خلوت برای نمایش به اینترنت نیاز دارند.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {promptVisible && installEvent && !hideInstallPrompt ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[95] sm:inset-x-auto sm:left-4 sm:max-w-sm">
          <div className="pointer-events-auto overflow-hidden rounded-[1.9rem] border border-border bg-card shadow-[0_22px_70px_rgba(94,58,47,0.16)]">
            <div className="border-b border-border bg-linear-to-br from-card via-background to-primary-soft/18 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_30px_rgba(138,90,68,0.24)]">
                    <Download className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-foreground">خلوت را نصب کن</p>
                    <p className="mt-1 text-xs leading-6 text-muted">
                      برای دسترسی سریع‌تر، خلوت را مثل یک اپ روی دستگاهت نصب کن.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors hover:bg-card-soft"
                  aria-label="بستن"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3">
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-2xl border border-border bg-background/70 px-4 py-2 text-xs font-black text-muted transition-colors hover:border-primary-soft hover:text-primary"
              >
                بعداً
              </button>
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-black text-white shadow-[0_12px_30px_rgba(138,90,68,0.22)] transition-colors hover:bg-primary-dark"
              >
                <Download className="size-3.5" />
                نصب
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
