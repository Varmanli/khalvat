"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-card/88 shadow-[0_4px_24px_rgba(94,58,47,0.08)] backdrop-blur-2xl"
          : "border-b border-transparent bg-background/60 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            aria-label="صفحه اصلی خلوت"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span className="relative flex items-center">
              <span className="absolute -inset-2 rounded-3xl bg-primary-soft/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <Image
                src="/logo.png"
                alt="لوگوی خلوت"
                width={160}
                height={48}
                className="relative h-10 w-auto object-contain sm:h-12"
                priority
              />
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-border bg-card/70 px-2 py-1 text-sm font-medium text-muted lg:flex">
            <a
              href="#features"
              className="rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-primary-soft/25 hover:text-primary"
            >
              امکانات
            </a>
            <a
              href="#moods"
              className="rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-primary-soft/25 hover:text-primary"
            >
              حال‌وهوا
            </a>
            <a
              href="#about"
              className="rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-primary-soft/25 hover:text-primary"
            >
              درباره
            </a>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-2xl px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-foreground sm:inline-flex"
            >
              ورود
            </Link>

            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-l from-primary-dark via-primary to-[#A56A4B] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_24px_rgba(138,90,68,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(138,90,68,0.32)] active:translate-y-0 sm:px-5"
            >
              <span className="absolute inset-0 bg-linear-to-l from-white/0 via-white/12 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Sparkles className="relative size-3.5 opacity-90" />
              <span className="relative">شروع کن</span>
              <ArrowLeft className="relative size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
