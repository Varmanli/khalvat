import { AppShell } from "@/components/app-shell";
import { DeleteEntryButton } from "@/components/delete-entry-button";
import { MoodBadge } from "@/components/mood-badge";
import { RenderEntryContent } from "@/components/render-entry-content";
import { TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/constants";
import { getUserEntryById } from "@/lib/entries";
import { formatPersianDate, formatPersianDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Feather,
  Folder,
  Hash,
  Layers,
  Pencil,
  Pin,
  Quote,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EntryDetailPage({ params }: Props) {
  const session = await requireUser();
  const { id } = await params;

  const entry = await getUserEntryById(session.userId, id);
  if (!entry) notFound();

  const isUpdated =
    entry.updatedAt.getTime() - entry.createdAt.getTime() > 5000;

  return (
    <AppShell>
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 left-0 size-72 rounded-full bg-primary-soft/25 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-44 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6">
          {/* Breadcrumb */}
          <Link
            href="/entries"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
          >
            <ChevronRight size={14} />
            همه نوشته‌ها
          </Link>

          {/* Hero */}
          <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.09)]">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/20" />
            <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-tl-[7rem] bg-primary/8" />

            <div className="relative p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    {entry.isPinned && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-black text-gold">
                        <Pin className="size-3.5" />
                        پین‌شده
                      </span>
                    )}

                    <TypeBadge type={entry.type} />
                    <MoodBadge mood={entry.mood} />

                    <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-bold text-muted">
                      {STATUS_LABELS[entry.status]}
                    </span>
                  </div>

                  <h1 className="max-w-4xl wrap-break-word text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
                    {entry.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4 text-primary" />
                      نوشته شده: {formatPersianDate(entry.createdAt)}
                    </span>

                    {isUpdated && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-4 text-primary" />
                        ویرایش شده: {formatPersianDate(entry.updatedAt)}
                      </span>
                    )}

                    {entry.reminderAt && (
                      <span className="inline-flex items-center gap-1.5 text-warning">
                        <Bell className="size-4" />
                        یادآوری: {formatPersianDateTime(entry.reminderAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/entries/${id}/edit`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5 rounded-2xl"
                    >
                      <Pencil size={14} />
                      ویرایش
                    </Button>
                  </Link>

                  <DeleteEntryButton entryId={id} />
                </div>
              </div>
            </div>
          </section>

          {/* Main layout */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* Reading paper */}
            <main className="min-w-0">
              <article className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.08)]">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-card" />
                <div className="pointer-events-none absolute right-8 top-0 h-full w-px bg-linear-to-b from-transparent via-primary-soft/45 to-transparent" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-primary-soft/18 blur-3xl" />

                <div className="relative border-b border-border bg-background/45 px-5 py-4 sm:px-7">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
                        <BookOpen className="size-5" />
                      </span>

                      <div>
                        <p className="text-sm font-black text-foreground">
                          صفحه خواندن
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          نوشته‌ای از دفتر خلوت تو
                        </p>
                      </div>
                    </div>

                    <Quote className="hidden size-6 text-gold sm:block" />
                  </div>
                </div>

                <div className="relative p-5 sm:p-8 lg:p-10">
                  <div className="entry-reading-content rounded-[1.75rem] border border-border/70 bg-background/55 p-5 shadow-inner sm:p-7 lg:p-8">
                    <RenderEntryContent content={entry.content} />
                  </div>
                </div>
              </article>
            </main>

            {/* Sidebar */}
            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <section className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-card-soft text-primary">
                    <Layers className="size-4" />
                  </span>

                  <div>
                    <h2 className="text-sm font-black text-foreground">
                      مشخصات نوشته
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      حال‌وهوا، نوع و وضعیت این صفحه
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <MetaRow
                    label="نوع"
                    value={<TypeBadge type={entry.type} />}
                  />
                  <MetaRow
                    label="حال‌وهوا"
                    value={<MoodBadge mood={entry.mood} />}
                  />
                  <MetaRow
                    label="وضعیت"
                    value={
                      <span className="rounded-full bg-card-soft px-2.5 py-1 text-xs font-bold text-muted">
                        {STATUS_LABELS[entry.status]}
                      </span>
                    }
                  />

                  {entry.category && (
                    <MetaRow
                      label="دسته‌بندی"
                      value={
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black text-white shadow-sm"
                          style={{ backgroundColor: entry.category.color }}
                        >
                          <Folder className="size-3.5" />
                          {entry.category.name}
                        </span>
                      }
                    />
                  )}

                  {entry.isPinned && (
                    <MetaRow
                      label="پین"
                      value={
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
                          <Pin className="size-3.5" />
                          پین‌شده
                        </span>
                      }
                    />
                  )}
                </div>
              </section>

              {entry.tags.length > 0 && (
                <section className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-card-soft text-primary">
                      <Hash className="size-4" />
                    </span>

                    <div>
                      <h2 className="text-sm font-black text-foreground">
                        تگ‌ها
                      </h2>
                      <p className="mt-1 text-xs text-muted">
                        راه‌های برگشتن به این نوشته
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/entries?tag=${encodeURIComponent(tag.slug)}`}
                        className="rounded-full bg-card-soft px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:bg-primary-soft hover:text-primary-dark"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="relative overflow-hidden rounded-4xl border border-border bg-background/70 p-4 shadow-[0_14px_50px_rgba(94,58,47,0.05)]">
                <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-gold/12 blur-3xl" />

                <Feather className="relative mb-3 size-4 text-gold" />

                <p className="relative text-sm leading-7 text-muted">
                  بعضی نوشته‌ها برای تمام شدن نیستند؛ برای برگشتن‌اند.
                </p>

                <div className="relative mt-4 flex flex-col gap-2">
                  <Link
                    href={`/entries/${id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(138,90,68,0.22)] transition-colors hover:bg-primary-dark"
                  >
                    <Pencil className="size-4" />
                    ویرایش نوشته
                  </Link>

                  <Link
                    href="/entries"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-black text-foreground transition-colors hover:border-primary-soft hover:text-primary"
                  >
                    همه نوشته‌ها
                    <ArrowLeft className="size-4" />
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/55 px-3 py-3">
      <span className="text-xs font-bold text-muted">{label}</span>
      <div className="flex shrink-0 items-center">{value}</div>
    </div>
  );
}
