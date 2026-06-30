import { AppShell } from "@/components/app-shell";
import { EntryForm } from "@/components/entry-form";
import { requireUser } from "@/lib/auth";
import { getUserEntryById } from "@/lib/entries";
import { getUserEntryCategories } from "@/lib/entry-categories";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Feather,
  History,
  PenLine,
  Quote,
  Sparkles,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEntryPage({ params }: Props) {
  const session = await requireUser();
  const { id } = await params;

  const [entry, categories] = await Promise.all([
    getUserEntryById(session.userId, id),
    getUserEntryCategories(session.userId),
  ]);
  if (!entry) notFound();

  const tagsString = entry.tags.map((tag) => tag.name).join(", ");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Breadcrumb + Page Header */}
        <div className="flex flex-col gap-4">
          <Link
            href={`/entries/${id}`}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
          >
            <ChevronRight size={14} />
            بازگشت به نوشته
          </Link>

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-6">
            <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-gold/12 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 size-40 rounded-tl-[5rem] bg-primary-soft/18" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted">
                  <PenLine className="size-3.5 text-primary" />
                  ویرایش صفحه
                </div>

                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  ویرایش نوشته
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                  می‌توانی این نوشته را آرام‌تر، دقیق‌تر یا کامل‌تر کنی.
                </p>

                <p className="mt-2 max-w-xl truncate text-xs font-bold text-primary-dark">
                  {entry.title}
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-2xl border border-border bg-background/65 px-4 py-3 text-xs font-bold text-muted md:flex">
                <Sparkles className="size-4 text-gold" />
                هر نوشته می‌تواند یک بار دیگر بهتر شود.
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
            <section className="overflow-hidden rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
                  <BookOpen className="size-4" />
                </span>

                <div>
                  <h2 className="text-sm font-black text-foreground">
                    راهنمای ویرایش
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    قبل از ذخیره، نوشته را یک بار آرام‌تر مرور کن.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <EditHint
                  icon={<Feather className="size-4" />}
                  title="اصل حس را نگه دار"
                  text="ویرایش خوب یعنی شفاف‌تر کردن، نه عوض کردن حال نوشته."
                />

                <EditHint
                  icon={<PenLine className="size-4" />}
                  title="اضافه یا کم کن"
                  text="اگر جمله‌ای زیادی سنگین است، ساده‌ترش کن."
                />

                <EditHint
                  icon={<Bell className="size-4" />}
                  title="زمان برگشت بگذار"
                  text="اگر این نوشته هنوز کار دارد، برایش یادآور بگذار."
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-4xl border border-border bg-background/70 p-4 shadow-[0_14px_50px_rgba(94,58,47,0.05)]">
              <Quote className="mb-3 size-4 text-gold" />

              <p className="text-sm leading-7 text-muted">
                گاهی ویرایش، یعنی پیدا کردن همان جمله‌ای که از اول دنبالش بودی.
              </p>
            </section>

            <section className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
                  <History className="size-4" />
                </span>

                <div>
                  <h2 className="text-sm font-black text-foreground">
                    درباره این نوشته
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">
                    {entry.title}
                  </p>
                  <p className="mt-3 text-xs text-muted">
                    تگ‌ها:{" "}
                    {entry.tags.length > 0
                      ? entry.tags.map((tag) => tag.name).join("، ")
                      : "بدون تگ"}
                  </p>
                </div>
              </div>
            </section>
          </aside>

          {/* Form Area */}
          <main className="min-w-0">
            <div className="rounded-4xl border border-border bg-card p-4 shadow-[0_20px_80px_rgba(94,58,47,0.07)] sm:p-5 lg:p-6">
              <div className="mb-6 flex flex-col gap-2 border-b border-border pb-5">
                <h2 className="text-base font-black text-foreground">
                  صفحه ویرایش
                </h2>
                <p className="text-sm leading-6 text-muted">
                  متن، تگ‌ها، حال‌وهوا، وضعیت و یادآور این نوشته را به‌روزرسانی
                  کن.
                </p>
              </div>

              <EntryForm
                entryId={id}
                categories={categories}
                defaultValues={{
                  title: entry.title,
                  content: entry.content,
                  type: entry.type,
                  mood: entry.mood,
                  status: entry.status,
                  isPinned: entry.isPinned,
                  reminderAt: entry.reminderAt
                    ? entry.reminderAt.toISOString()
                    : undefined,
                  tags: tagsString,
                  categoryId: entry.categoryId ?? "",
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}

function EditHint({
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
