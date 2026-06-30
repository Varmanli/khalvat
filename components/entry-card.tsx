import { MoodBadge } from "@/components/mood-badge";
import { PinToggleButton } from "@/components/pin-toggle-button";
import { TypeBadge } from "@/components/type-badge";
import {
  STATUS_LABELS,
  type EntryMood,
  type EntryStatus,
  type EntryType,
} from "@/lib/constants";
import { htmlToPlainText } from "@/lib/html-utils";
import type { TagInfo } from "@/lib/tags";
import type { EntryCategoryInfo } from "@/lib/entries";
import {
  formatPersianDate,
  formatReminderLabel,
  isPast,
  isToday,
} from "@/lib/utils";
import { formatPersianNumber } from "@/lib/persian-numbers";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  Clock3,
  Folder,
  Hash,
  Pin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface EntryCardProps {
  id: string;
  title: string;
  content: string;
  type: EntryType;
  mood: EntryMood;
  status: EntryStatus;
  isPinned: boolean;
  reminderAt?: Date | null;
  createdAt: Date;
  tags?: TagInfo[];
  category?: EntryCategoryInfo | null;
}

export function EntryCard({
  id,
  title,
  content,
  type,
  mood,
  status,
  isPinned,
  reminderAt,
  createdAt,
  tags = [],
  category,
}: EntryCardProps) {
  const plainContent = htmlToPlainText(content);
  const visibleTags = tags.slice(0, 4);
  const extraTagCount = tags.length - visibleTags.length;

  const hasReminder = Boolean(reminderAt);
  const reminderIsToday = hasReminder && isToday(reminderAt!);
  const reminderIsPast = hasReminder && isPast(reminderAt!) && !reminderIsToday;
  const reminderIsFuture = hasReminder && !reminderIsToday && !reminderIsPast;

  return (
    <article className="group/card relative overflow-hidden rounded-4xl border border-border bg-card shadow-[0_18px_70px_rgba(94,58,47,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-soft hover:shadow-[0_30px_100px_rgba(94,58,47,0.14)]">
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background/70 to-primary-soft/14" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-52 rounded-full bg-gold/12 blur-3xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
      <div className="pointer-events-none absolute -bottom-24 right-16 size-56 rounded-full bg-primary-soft/20 blur-3xl" />

      {/* Book spine / notebook edge */}
      <div className="absolute bottom-0 right-0 top-0 z-10 w-2 bg-linear-to-b from-primary-dark via-primary to-primary-soft opacity-85" />
      <div className="absolute bottom-5 right-5 top-5 z-10 w-px bg-primary-soft/55" />

      {/* Status top glow */}
      {reminderIsToday && (
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-warning" />
      )}
      {reminderIsFuture && (
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-gold/70" />
      )}
      {reminderIsPast && (
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-border" />
      )}
      {isPinned && !hasReminder && (
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-gold/70" />
      )}

      {/* Pin button */}
      <div className="absolute left-4 top-4 z-30 opacity-100 transition-all duration-200 sm:opacity-0 sm:group-hover/card:opacity-100">
        <PinToggleButton entryId={id} isPinned={isPinned} />
      </div>

      <Link href={`/entries/${id}`} className="relative z-20 block">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]">
          {/* Main content */}
          <div className="min-w-0 p-5 pe-8 sm:p-6 sm:pe-10">
            {/* Header chips */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {isPinned && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-[11px] font-black text-gold">
                  <Pin className="size-3.5" />
                  پین‌شده
                </span>
              )}

              {reminderIsToday && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/25 bg-warning/10 px-3 py-1.5 text-[11px] font-black text-warning">
                  <Bell className="size-3.5" />
                  یادآوری امروز
                </span>
              )}

              {reminderIsFuture && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-[11px] font-bold text-gold">
                  <Bell className="size-3.5" />
                  {formatReminderLabel(reminderAt!)}
                </span>
              )}

              {reminderIsPast && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-[11px] font-bold text-muted line-through">
                  <Clock3 className="size-3.5" />
                  گذشته
                </span>
              )}
            </div>

            {/* Title */}
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark shadow-sm transition-all duration-300 group-hover/card:bg-primary group-hover/card:text-white">
                <BookOpen className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-xl font-black leading-9 text-foreground transition-colors duration-200 group-hover/card:text-primary">
                  {title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <TypeBadge type={type} />
                  <MoodBadge mood={mood} />

                  <span className="rounded-full bg-card-soft px-2.5 py-1 text-[11px] font-bold text-muted">
                    {STATUS_LABELS[status]}
                  </span>

                  {category && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black text-white shadow-sm"
                      style={{ backgroundColor: category.color }}
                    >
                      <Folder className="size-3" />
                      {category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Preview paper */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/65 p-4 shadow-inner">
              <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 rounded-tr-[4rem] bg-gold/8" />

              <p className="relative line-clamp-3 text-sm leading-8 text-muted">
                {plainContent || "این نوشته هنوز متن زیادی ندارد."}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {tags.length > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-bold text-muted">
                    <Hash className="size-3" />
                    تگ‌ها
                  </span>

                  {visibleTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-card-soft px-2.5 py-1 text-[11px] font-bold text-muted transition-colors group-hover/card:bg-primary-soft/60 group-hover/card:text-primary-dark"
                    >
                      #{tag.name}
                    </span>
                  ))}

                  {extraTagCount > 0 && (
                    <span className="rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-bold text-muted">
                      +{formatPersianNumber(extraTagCount)}
                    </span>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-bold text-muted/75">
                  <Sparkles className="size-3" />
                  بدون تگ
                </span>
              )}
            </div>
          </div>

          {/* Side meta rail */}
          <div className="relative border-t border-border bg-background/45 p-5 sm:p-6 lg:border-r lg:border-t-0">
            <div className="flex h-full flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="rounded-[1.35rem] border border-border bg-card/80 p-4 shadow-sm">
                  <p className="mb-2 text-[11px] font-bold text-muted">
                    تاریخ ثبت
                  </p>

                  <div className="flex items-center gap-2 text-sm font-black text-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    {formatPersianDate(createdAt)}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-border bg-card/80 p-4 shadow-sm">
                  <p className="mb-2 text-[11px] font-bold text-muted">
                    وضعیت خواندن
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-foreground">
                      آماده مرور
                    </span>
                    <span className="flex size-8 items-center justify-center rounded-xl bg-card-soft text-primary transition-all duration-300 group-hover/card:bg-primary group-hover/card:text-white">
                      <ArrowLeft className="size-4 transition-transform duration-300 group-hover/card:-translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white opacity-95 shadow-[0_16px_40px_rgba(138,90,68,0.22)] transition-all duration-300 group-hover/card:bg-primary-dark group-hover/card:shadow-[0_20px_55px_rgba(138,90,68,0.3)]">
                خواندن نوشته
                <ArrowLeft className="size-4 transition-transform duration-300 group-hover/card:-translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
