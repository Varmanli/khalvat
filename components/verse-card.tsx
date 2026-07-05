"use client";

import type { DailyVerse } from "@/lib/poem-types";
import { getPoemPreview } from "@/lib/poem-preview";
import { cn } from "@/lib/utils";
import { BookOpen, Feather, Quote, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface VerseCardProps {
  verse: DailyVerse;
  variant?: "hero" | "compact" | "inline" | "side";
  title?: string;
  subtitle?: string;
  showCopy?: boolean;
  className?: string;
}

function formatVerseForCopy(verse: DailyVerse) {
  const attribution = [verse.poet, verse.source].filter(Boolean).join(" — ");

  return attribution ? `${verse.text}\n\n${attribution}` : verse.text;
}

function VerseLines({ text, className }: { text: string; className?: string }) {
  const preview = getPoemPreview(text, 2);
  const lines = preview.lines;

  return (
    <p className={cn("whitespace-pre-line", className)}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="block">
          {line}
        </span>
      ))}
    </p>
  );
}

function VerseAttribution({ verse }: { verse: DailyVerse }) {
  if (!verse.poet && !verse.source) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold leading-6 text-muted">
      <span>{[verse.poet, verse.source].filter(Boolean).join(" — ")}</span>
      {verse.url ? (
        <Link
          href={verse.url}
          target="_blank"
          rel="noreferrer"
          className="text-primary transition-colors hover:text-primary-dark"
        >
          منبع
        </Link>
      ) : null}
    </div>
  );
}

export function VerseCard({
  verse,
  variant = "compact",
  title,
  subtitle,
  showCopy = true,
  className = "",
}: VerseCardProps) {
  const [, setCopied] = useState(false);

  async function handleCopy() {
    if (!showCopy) return;

    try {
      await navigator.clipboard.writeText(formatVerseForCopy(verse));
      setCopied(true);
      toast.success("بیت کپی شد");

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      toast.error("کپی کردن بیت انجام نشد");
    }
  }

  const interactiveProps = showCopy
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick: handleCopy,
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCopy();
          }
        },
      }
    : {};

  if (variant === "side") {
    return (
      <div
        {...interactiveProps}
        className={cn(
          "group relative overflow-hidden rounded-4xl border border-border bg-card shadow-[0_22px_80px_rgba(94,58,47,0.08)] transition-all duration-300",
          showCopy &&
            "cursor-pointer hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_28px_90px_rgba(94,58,47,0.13)] focus:outline-none focus:ring-4 focus:ring-primary-soft/35",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-gold/10" />
        <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 left-0 size-32 rounded-full bg-primary-soft/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-tl-[5rem] bg-primary/7" />

        <div className="relative p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-gold/25 via-primary-soft/45 to-card-soft text-primary-dark shadow-[0_12px_32px_rgba(196,154,90,0.2)] ring-1 ring-white/55">
              <Feather className="size-5" />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-black text-foreground">
                {title ?? "بیت امروز"}
              </p>
              {subtitle && (
                <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border/75 bg-background/70 p-4 shadow-inner">
            <Quote className="mb-3 size-4 text-gold" />

            <VerseLines
              text={verse.text}
              className="text-sm font-semibold leading-8 text-foreground"
            />

            <VerseAttribution verse={verse} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div
        {...interactiveProps}
        className={cn(
          "group relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_28px_100px_rgba(94,58,47,0.1)] transition-all duration-300",
          showCopy &&
            "cursor-pointer hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_34px_120px_rgba(94,58,47,0.16)] focus:outline-none focus:ring-4 focus:ring-primary-soft/35",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/20" />
        <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-tl-[8rem] bg-primary/8" />

        <div className="relative p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary-dark text-white shadow-[0_16px_40px_rgba(138,90,68,0.28)]">
                <BookOpen className="size-5" />
              </span>

              <div>
                <p className="text-base font-black text-foreground">
                  {title ?? "بیت امروز"}
                </p>
                {subtitle && (
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/75 px-3 py-1.5 text-xs font-black text-muted">
              <Sparkles className="size-3.5 text-gold" />
              از دفتر شاعران
            </span>
          </div>

          <div className="rounded-[1.75rem] border border-border/80 bg-background/70 p-5 shadow-inner sm:p-6">
            <Quote className="mb-4 size-5 text-gold" />

            <VerseLines
              text={verse.text}
              className="text-xl font-black leading-10 text-foreground sm:text-2xl sm:leading-13"
            />

            <VerseAttribution verse={verse} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        {...interactiveProps}
        className={cn(
          "group flex items-start gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3 transition-all duration-200",
          showCopy &&
            "cursor-pointer hover:border-primary-soft hover:bg-card focus:outline-none focus:ring-4 focus:ring-primary-soft/35",
          className,
        )}
      >
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-card-soft text-gold">
          <Quote className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <VerseLines
            text={verse.text}
            className="text-sm font-semibold leading-7 text-foreground"
          />
          <VerseAttribution verse={verse} />
        </div>
      </div>
    );
  }

  return (
    <div
      {...interactiveProps}
      className={cn(
        "group relative overflow-hidden rounded-4xl border border-border bg-card shadow-[0_20px_70px_rgba(94,58,47,0.08)] transition-all duration-300",
        showCopy &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_28px_90px_rgba(94,58,47,0.13)] focus:outline-none focus:ring-4 focus:ring-primary-soft/35",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/15" />
      <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-0 size-28 rounded-full bg-primary-soft/25 blur-3xl" />

      <div className="relative p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-gold/25 via-primary-soft/45 to-card-soft text-primary-dark shadow-[0_10px_28px_rgba(196,154,90,0.18)]">
              <Feather className="size-5" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground">
                {title ?? "بیت امروز"}
              </p>
              {subtitle && (
                <p className="mt-1 line-clamp-1 text-xs text-muted">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <span className="hidden rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted sm:inline-flex">
            از گنجور
          </span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border/75 bg-background/70 p-4 shadow-inner">
          <Quote className="mb-3 size-4 text-gold" />

          <VerseLines
            text={verse.text}
            className="text-sm font-semibold leading-8 text-foreground sm:text-[15px]"
          />

          <VerseAttribution verse={verse} />
        </div>
      </div>
    </div>
  );
}
