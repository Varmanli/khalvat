import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Feather,
  Lightbulb,
  ListChecks,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { eq } from "drizzle-orm";

import { AppShell } from "@/components/app-shell";
import { TaskForm } from "@/components/task-form";
import { DailyGuideCard } from "@/components/sidebar/daily-guide-card";
import { DailyVerseCard } from "@/components/sidebar/daily-verse-card";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getUserTaskCategories } from "@/lib/task-categories";

export default async function NewTaskPage() {
  const session = await requireUser();

  const [userRows, categories] = await Promise.all([
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),
    getUserTaskCategories(session.userId),
  ]);

  const userName = userRows[0]?.name ?? "";

  return (
    <AppShell userName={userName}>
      <div className="relative">
        <div className="pointer-events-none absolute -top-12 right-0 size-72 rounded-full bg-primary-soft/20 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-36 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <NewTaskHero userName={userName} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="min-w-0">
              <section className="relative overflow-visible rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.08)]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.25rem]">
                  <div className="absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/16" />
                  <div className="absolute -right-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" />
                  <div className="absolute bottom-0 left-0 size-48 rounded-tr-[6rem] bg-primary-soft/16" />
                </div>

                <div className="relative p-5 sm:p-7">
                  <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark shadow-[0_12px_32px_rgba(94,58,47,0.1)]">
                        <PlusCircle className="size-5" />
                      </span>

                      <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
                          <Sparkles className="size-3.5 text-gold" />
                          یک چیز کمتر توی ذهن
                        </div>

                        <h2 className="text-lg font-black text-foreground">
                          نوشتن وظیفه جدید
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
                          کار را همین‌قدر ساده بنویس که وقتی برگشتی، دقیق بدانی
                          باید از کجا شروع کنی.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/tasks"
                      className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2.5 text-xs font-black text-primary shadow-sm transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
                    >
                      بازگشت به وظایف
                      <ArrowLeft className="size-3.5" />
                    </Link>
                  </div>

                  <TaskForm categories={categories} />
                </div>
              </section>
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <DailyGuideCard
                title="راهنمای نوشتن وظیفه"
                subtitle="یک کار واضح، یک قدم کوچک"
                tips={[
                  { icon: <Lightbulb className="size-3.5" />, text: "کوچکش کن — «مرتب کردن میز» نه «مرتب کردن زندگی»" },
                  { icon: <CalendarCheck className="size-3.5" />, text: "تاریخ بگذار تا ذهنت خلوت‌تر بشه" },
                  { icon: <CheckCircle2 className="size-3.5" />, text: "بپرس کدام کار امروز دلت را سبک می‌کند؟" },
                ]}
              />

              <DailyVerseCard />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function NewTaskHero({ userName }: { userName: string }) {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.1)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/20" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-tl-[8rem] bg-primary/8" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-8">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <Link
              href="/tasks"
              className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
            >
              <ArrowLeft className="size-3.5 rotate-180" />
              دفتر وظایف
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              {userName ? `سلام ${userName}` : "یک کار تازه"}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              یک وظیفه تازه بنویس
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              هر چیزی که نباید یادت برود، از ذهنت بردار و اینجا آرام نگهش دار.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniHeroStat
              icon={<ClipboardList className="size-4" />}
              label="بنویس"
              text="تا از ذهن بیرون بیاد"
            />
            <MiniHeroStat
              icon={<CalendarCheck className="size-4" />}
              label="زمان بده"
              text="اگر روز مشخصی داره"
            />
            <MiniHeroStat
              icon={<CheckCircle2 className="size-4" />}
              label="سبک شو"
              text="وقتی انجامش دادی"
            />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/82 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">قبل از ثبت</p>
                <p className="mt-1 text-lg font-black text-foreground">
                  سه سؤال کوتاه
                </p>
              </div>

              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
                <ListChecks className="size-5" />
              </span>
            </div>

            <div className="space-y-3">
              <HeroPrompt text="دقیقاً باید چه کاری انجام بشه؟" />
              <HeroPrompt text="کی بهتره یادم بیاد؟" />
              <HeroPrompt text="انجامش چقدر دلم رو سبک می‌کنه؟" />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Feather className="mb-2 size-4 text-gold" />
              <p className="text-sm leading-7 text-muted">
                وظیفه خوب قرار نیست سنگین باشه؛ فقط باید شروعش معلوم باشه.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniHeroStat({
  icon,
  label,
  text,
}: {
  icon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-card/75 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
          {icon}
        </span>

        <div>
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="mt-1 text-sm font-black text-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

function HeroPrompt({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-3 py-3 text-sm font-bold text-foreground">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        <CheckCircle2 className="size-4" />
      </span>
      {text}
    </div>
  );
}

