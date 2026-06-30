import { AppShell } from "@/components/app-shell";
import { EntriesFilters } from "@/components/entries-filters";
import { EntryCard } from "@/components/entry-card";
import { requireUser } from "@/lib/auth";
import type { EntryMood, EntryStatus, EntryType } from "@/lib/constants";
import { getUserEntries } from "@/lib/entries";
import { getUserEntryCategories } from "@/lib/entry-categories";
import { formatPersianNumber } from "@/lib/persian-numbers";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Filter,
  PenLine,
  PlusCircle,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    q?: string;
    type?: string;
    mood?: string;
    status?: string;
    tag?: string;
    categoryId?: string;
  }>;
}

export default async function EntriesPage({ searchParams }: Props) {
  const session = await requireUser();
  const { q, type, mood, status, tag, categoryId } = await searchParams;

  const [entries, categories] = await Promise.all([
    getUserEntries(session.userId, {
      q: q || undefined,
      type: (type as EntryType) || undefined,
      mood: (mood as EntryMood) || undefined,
      status: (status as EntryStatus) || undefined,
      tag: tag || undefined,
      categoryId: categoryId || undefined,
    }),
    getUserEntryCategories(session.userId),
  ]);

  const hasFilters = Boolean(q || type || mood || status || tag || categoryId);
  const pinnedCount = entries.filter((entry) => entry.isPinned).length;

  return (
    <AppShell>
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 left-0 size-72 rounded-full bg-primary-soft/25 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-40 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.09)]">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/20" />
            <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-tl-[7rem] bg-primary/8" />

            <div className="relative p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm">
                    <BookOpen className="size-3.5 text-primary" />
                    کتابخانه خلوت
                  </div>

                  <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
                    همه نوشته‌ها
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    هر صفحه‌ای که نوشته‌ای، اینجا آرام کنار هم مانده است.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                  <Link
                    href="/entries/new"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_18px_44px_rgba(138,90,68,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_24px_60px_rgba(138,90,68,0.32)]"
                  >
                    <PlusCircle className="size-5" />
                    نوشته جدید
                    <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </Link>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <ArchiveStat
                  icon={<FileText className="size-4" />}
                  label="نتیجه فعلی"
                  value={`${formatPersianNumber(entries.length)} نوشته`}
                />

                <ArchiveStat
                  icon={<Sparkles className="size-4" />}
                  label="وضعیت صفحه"
                  value={hasFilters ? "فیلتر شده" : "همه نوشته‌ها"}
                />

                <ArchiveStat
                  icon={<PenLine className="size-4" />}
                  label="پین‌شده‌ها"
                  value={`${formatPersianNumber(pinnedCount)} نوشته`}
                />
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
                  {hasFilters ? (
                    <Search className="size-4" />
                  ) : (
                    <Filter className="size-4" />
                  )}
                </span>

                <div>
                  <h2 className="text-sm font-black text-foreground">
                    جستجو و فیلتر نوشته‌ها
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    با عنوان، متن، نوع، حال‌وهوا، وضعیت یا تگ، صفحه‌ای که
                    می‌خواهی را پیدا کن.
                  </p>
                </div>
              </div>

              {hasFilters && (
                <Link
                  href="/entries"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-primary transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
                >
                  پاک کردن فیلترها
                  <ArrowLeft className="size-3.5" />
                </Link>
              )}
            </div>

            <EntriesFilters
              initialQ={q}
              initialType={type}
              initialMood={mood}
              initialStatus={status}
              initialTag={tag}
              initialCategoryId={categoryId}
              categories={categories}
            />
          </section>

          {/* Content */}
          <section className="rounded-4xl border border-border bg-card/72 p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
                  <FileText className="size-4" />
                </span>

                <div>
                  <h2 className="text-base font-black text-foreground">
                    {hasFilters ? "نتیجه جستجو" : "صفحه‌های نوشته‌شده"}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {hasFilters
                      ? `${formatPersianNumber(entries.length)} نوشته با این فیلترها پیدا شد.`
                      : `${formatPersianNumber(entries.length)} نوشته در خلوتت ثبت شده است.`}
                  </p>
                </div>
              </div>

              {entries.length > 0 && (
                <Link
                  href="/entries/new"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 text-xs font-black text-primary transition-colors hover:bg-primary-soft/35 hover:text-primary-dark"
                >
                  <PenLine className="size-3.5" />
                  نوشتن صفحه تازه
                </Link>
              )}
            </div>

            {entries.length === 0 ? (
              <EmptyState hasFilters={hasFilters} hasCategoryFilter={Boolean(categoryId)} />
            ) : (
              <div className="grid gap-3">
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    id={entry.id}
                    title={entry.title}
                    content={entry.content}
                    type={entry.type}
                    mood={entry.mood}
                    status={entry.status}
                    isPinned={entry.isPinned}
                    reminderAt={entry.reminderAt}
                    createdAt={entry.createdAt}
                    tags={entry.tags}
                    category={entry.category}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function ArchiveStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-card/75 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
          {icon}
        </span>

        <div>
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="mt-1 text-sm font-black text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  hasCategoryFilter,
}: {
  hasFilters: boolean;
  hasCategoryFilter?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-4xl border border-dashed border-border bg-background/55 p-8 text-center sm:p-12">
      <div className="pointer-events-none absolute -left-14 -top-14 size-44 rounded-full bg-primary-soft/20 blur-3xl" />

      <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-card-soft text-primary">
        {hasFilters ? (
          <Search className="size-7" />
        ) : (
          <FileText className="size-7" />
        )}
      </div>

      <p className="relative text-lg font-black text-foreground">
        {hasFilters ? "نتیجه‌ای پیدا نشد" : "هنوز چیزی ننوشتی"}
      </p>

      <p className="relative mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
        {hasCategoryFilter
          ? "در این دسته‌بندی هنوز نوشته‌ای نداری."
          : hasFilters
            ? "فیلترها را کمی تغییر بده؛ شاید صفحه‌ای که دنبالش هستی با کلمه یا حال‌وهوای دیگری ثبت شده باشد."
            : "خلوتت منتظر اولین صفحه است؛ یک جمله کوتاه هم برای شروع کافی‌ست."}
      </p>

      <div className="relative mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
        {hasFilters ? (
          <Link
            href="/entries"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-black text-foreground transition-colors hover:border-primary-soft hover:text-primary"
          >
            پاک کردن فیلترها
            <ArrowLeft className="size-4" />
          </Link>
        ) : (
          <Link
            href="/entries/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(138,90,68,0.24)] transition-colors hover:bg-primary-dark"
          >
            <PenLine className="size-4" />
            اولین نوشته را بساز
          </Link>
        )}
      </div>
    </div>
  );
}
