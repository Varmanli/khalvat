import Link from "next/link";
import type { ReactNode } from "react";

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ClipboardPenLine,
  Feather,
  Lightbulb,
  ListChecks,
  Save,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { TaskForm } from "@/components/task-form";
import { DailyGuideCard } from "@/components/sidebar/daily-guide-card";
import { DailyVerseCard } from "@/components/sidebar/daily-verse-card";

import { db } from "@/db";
import { users } from "@/db/schema";

import { requireUser } from "@/lib/auth";
import { getUserTaskById } from "@/lib/tasks";
import { getUserTaskCategories } from "@/lib/task-categories";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTaskPage({ params }: Params) {
  const session = await requireUser();

  const { id } = await params;

  const [userRows, task, categories] = await Promise.all([
    db
      .select({
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),

    getUserTaskById(session.userId, id),

    getUserTaskCategories(session.userId),
  ]);

  if (!task) {
    notFound();
  }

  const userName = userRows[0]?.name ?? "";

  return (
    <AppShell userName={userName}>
      <div className="relative">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -top-12 right-0 size-72 rounded-full bg-primary-soft/20 blur-3xl" />

        <div className="pointer-events-none absolute left-0 top-36 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <EditTaskHero
            taskId={task.id}
            taskTitle={task.title}
            userName={userName}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Main form */}
            <main className="min-w-0">
              <section className="relative overflow-visible rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.08)]">
                {/* Card background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.25rem]">
                  <div className="absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/16" />

                  <div className="absolute -right-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" />

                  <div className="absolute bottom-0 left-0 size-48 rounded-tr-[6rem] bg-primary-soft/16" />
                </div>

                <div className="relative p-5 sm:p-7">
                  {/* Form heading */}
                  <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark shadow-[0_12px_32px_rgba(94,58,47,0.1)]">
                        <ClipboardPenLine className="size-5" />
                      </span>

                      <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
                          <Sparkles className="size-3.5 text-gold" />
                          یک بار دیگه مرتبش کن
                        </div>

                        <h2 className="text-lg font-black text-foreground">
                          ویرایش جزئیات وظیفه
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
                          عنوان، زمان، اولویت یا جزئیاتش رو تغییر بده تا وظیفه
                          همچنان واضح و قابل انجام بمونه.
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/tasks/${task.id}`}
                      className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2.5 text-xs font-black text-primary shadow-sm transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
                    >
                      بازگشت به وظیفه
                      <ArrowLeft className="size-3.5" />
                    </Link>
                  </div>

                  {/* Form */}
                  <TaskForm
                    taskId={task.id}
                    categories={categories}
                    defaultValues={{
                      title: task.title,
                      description: task.description ?? "",
                      priority: task.priority,
                      status: task.status,
                      categoryId: task.categoryId ?? "",
                      color: task.color ?? "",
                      dueAt: task.dueAt?.toISOString() ?? null,
                      scheduledDate: task.scheduledDate,
                      scheduledTime: task.scheduledTime,
                      scheduledEndTime: task.scheduledEndTime,
                      isPinned: task.isPinned,
                    }}
                  />
                </div>
              </section>
            </main>

            {/* Sidebar */}
            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <DailyGuideCard
                title="قبل از ذخیره"
                subtitle="فقط چیزهایی رو تغییر بده که واقعاً لازم‌اند"
                tips={[
                  {
                    icon: <Lightbulb className="size-3.5" />,
                    text: "عنوان هنوز واضح می‌گه دقیقاً چه کاری باید انجام بشه؟",
                  },
                  {
                    icon: <CalendarCheck className="size-3.5" />,
                    text: "اگر برنامه تغییر کرده، تاریخ و زمانش رو هم اصلاح کن",
                  },
                  {
                    icon: <CheckCircle2 className="size-3.5" />,
                    text: "اگر انجام شده یا متوقف شده، وضعیتش رو به‌روز کن",
                  },
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

/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

function EditTaskHero({
  taskId,
  taskTitle,
  userName,
}: {
  taskId: string;
  taskTitle: string;
  userName: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.1)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/20" />

      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/14 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-tl-[8rem] bg-primary/8" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-8">
        {/* Left */}
        <div className="flex flex-col justify-between gap-8">
          <div>
            <Link
              href={`/tasks/${taskId}`}
              className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
            >
              <ArrowLeft className="size-3.5 rotate-180" />
              جزئیات وظیفه
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />

              {userName ? `وقت مرتب‌کردنه، ${userName}` : "ویرایش وظیفه"}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              وظیفه رو
              <span className="mx-2 text-primary-dark">بهترش کن</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              شاید زمانش عوض شده، شاید توضیح بیشتری لازم داره یا فقط می‌خوای
              وضعیتش رو به‌روز کنی.
            </p>

            <div className="mt-5 max-w-xl rounded-2xl border border-border bg-background/60 px-4 py-3">
              <p className="text-[10px] font-black text-muted">در حال ویرایش</p>

              <p className="mt-1 truncate text-sm font-black text-foreground">
                {taskTitle}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniHeroStat
              icon={<ClipboardPenLine className="size-4" />}
              label="مرتب کن"
              text="جزئیات لازم"
            />

            <MiniHeroStat
              icon={<CalendarCheck className="size-4" />}
              label="زمان"
              text="در صورت تغییر"
            />

            <MiniHeroStat
              icon={<Save className="size-4" />}
              label="ذخیره کن"
              text="و ادامه بده"
            />
          </div>
        </div>

        {/* Right */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/82 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">یک بررسی کوتاه</p>

                <p className="mt-1 text-lg font-black text-foreground">
                  قبل از ذخیره
                </p>
              </div>

              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
                <ListChecks className="size-5" />
              </span>
            </div>

            <div className="space-y-3">
              <HeroPrompt text="عنوان هنوز واضح و قابل فهمه؟" />

              <HeroPrompt text="زمان یا موعدش هنوز درسته؟" />

              <HeroPrompt text="وضعیتش با شرایط فعلی هماهنگه؟" />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Feather className="mb-2 size-4 text-gold" />

              <p className="text-sm leading-7 text-muted">
                ویرایش خوب یعنی وظیفه بعد از تغییر، واضح‌تر از قبل باشه؛ نه
                پیچیده‌تر.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               HERO HELPERS                                 */
/* -------------------------------------------------------------------------- */

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
