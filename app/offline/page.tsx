import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, ArrowLeft } from "lucide-react";
import { OfflineRetryButton } from "@/components/pwa/offline-retry-button";

export const metadata: Metadata = {
  title: "اتصال اینترنت قطع است",
  description: "برخی بخش‌های خلوت برای نمایش به اینترنت نیاز دارند.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-[2.5rem] border border-border bg-card p-6 shadow-[0_28px_100px_rgba(94,58,47,0.1)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/16" />
          <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-card-soft text-primary shadow-sm">
              <WifiOff className="size-8" />
            </div>

            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/75 px-3 py-1.5 text-xs font-black text-muted">
              خلوت در حالت آفلاین
            </p>

            <h1 className="text-2xl font-black leading-tight text-foreground sm:text-3xl">
              اتصال اینترنت قطع است
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-muted sm:text-base">
              برخی بخش‌های خلوت برای نمایش به اینترنت نیاز دارند.
              وقتی دوباره آنلاین شدی، صفحه را تازه کن یا به خانه برگرد.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(138,90,68,0.22)] transition-colors hover:bg-primary-dark"
              >
                بازگشت به خانه
                <ArrowLeft className="size-4" />
              </Link>

              <OfflineRetryButton />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
