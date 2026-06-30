import { AppShell } from "@/components/app-shell";
import { EntryForm } from "@/components/entry-form";
import { VerseCard } from "@/components/verse-card";
import { requireUser } from "@/lib/auth";
import { getDailyVerse } from "@/lib/ganjoor";
import { getUserEntryCategories } from "@/lib/entry-categories";
import Link from "next/link";
import { Bell, BookOpen, ChevronRight, Feather, Lightbulb, PenLine, Quote, Sparkles } from "lucide-react";

export default async function NewEntryPage() {
  const session = await requireUser();

  const [verse, categories] = await Promise.all([
    getDailyVerse(),
    getUserEntryCategories(session.userId),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Breadcrumb + Page Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
          >
            <ChevronRight size={14} />
            داشبورد
          </Link>

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-6">
            <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-gold/12 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 size-40 rounded-tl-[5rem] bg-primary-soft/18" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted">
                  <PenLine className="size-3.5 text-primary" />
                  صفحه تازه
                </div>

                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  نوشته جدید
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                  یک فکر، یک حس یا یک جرقه را قبل از فراموشی همین‌جا نگه دار.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-2xl border border-border bg-background/65 px-4 py-3 text-xs font-bold text-muted md:flex">
                <Sparkles className="size-4 text-gold" />
                لازم نیست کامل باشد؛ فقط شروع کن.
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
            <VerseCard
              verse={verse}
              variant="side"
              title="جرقه‌ای برای نوشتن"
              subtitle="یک بیت کوتاه برای شروع آرام‌تر."
            />

            <section className="overflow-hidden rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
                  <BookOpen className="size-4" />
                </span>

                <div>
                  <h2 className="text-sm font-black text-foreground">
                    راهنمای نوشتن
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    اگر ذهنت خالی بود، از این‌ها شروع کن.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <WritingHint
                  icon={<Feather className="size-4" />}
                  title="کوتاه بنویس"
                  text="لازم نیست متن کامل باشد؛ یک جمله هم کافی‌ست."
                />

                <WritingHint
                  icon={<Lightbulb className="size-4" />}
                  title="جرقه را نگه دار"
                  text="ایده‌های خام معمولاً بعداً معنا پیدا می‌کنند."
                />

                <WritingHint
                  icon={<Bell className="size-4" />}
                  title="اگر مهم است، یادآور بگذار"
                  text="چیزهایی که باید برگردی سراغشان را رها نکن."
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-4xl border border-border bg-background/70 p-4 shadow-[0_14px_50px_rgba(94,58,47,0.05)]">
              <Quote className="mb-3 size-4 text-gold" />

              <p className="text-sm leading-7 text-muted">
                بعضی فکرها فقط وقتی نوشته می‌شوند، آرام می‌گیرند.
              </p>
            </section>
          </aside>

          {/* Form Area */}
          <main className="min-w-0">
            <div className="rounded-4xl border border-border bg-card p-4 shadow-[0_20px_80px_rgba(94,58,47,0.07)] sm:p-5 lg:p-6">
              <div className="mb-6 flex flex-col gap-2 border-b border-border pb-5">
                <h2 className="text-base font-black text-foreground">
                  صفحه نوشتن
                </h2>
                <p className="text-sm leading-6 text-muted">
                  نوع نوشته، حال‌وهوا و یادآور را انتخاب کن؛ بعد هر چیزی که در
                  ذهنت مانده بنویس.
                </p>
              </div>

              <EntryForm categories={categories} />
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
function WritingHint({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-background/65 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        {icon}
      </span>

      <div>
        <p className="text-sm font-black text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
      </div>
    </div>
  );
}
