import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit2,
  Feather,
  Folder,
  Pin,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { eq } from "drizzle-orm";

import { AppShell } from "@/components/app-shell";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { TaskPriorityBadge } from "@/components/task-priority-badge";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { TaskToggleButton } from "@/components/task-toggle-button";
import { DailyVerseCard } from "@/components/sidebar/daily-verse-card";
import { RenderEntryContent } from "@/components/render-entry-content";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatJalaliDate, formatJalaliDateTime } from "@/lib/date";
import { getUserTaskById } from "@/lib/tasks";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: Params) {
  const session = await requireUser();
  const { id } = await params;

  const [userRows, task] = await Promise.all([
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),
    getUserTaskById(session.userId, id),
  ]);

  if (!task) notFound();

  const userName = userRows[0]?.name ?? "";
  const isDone = task.status === "done";

  return (
    <AppShell userName={userName}>
      <div className="relative">
        <div className="pointer-events-none absolute -top-12 right-0 size-72 rounded-full bg-primary-soft/20 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-36 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <TaskDetailHero task={task} isDone={isDone} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="min-w-0 space-y-6">
              <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.1)]">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/16" />
                <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-gold/12 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 size-56 rounded-tr-[7rem] bg-primary/8" />

                <div className="relative p-5 sm:p-7 lg:p-8">
                  <div className="mb-7 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <TaskToggleButton taskId={task.id} isDone={isDone} />

                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm">
                            <Sparkles className="size-3.5 text-gold" />
                            صفحه‌ی یک وظیفه
                          </span>

                          {task.isPinned && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft/45 px-3 py-1.5 text-xs font-black text-primary-dark">
                              <Pin className="size-3.5" />
                              پین‌شده
                            </span>
                          )}
                        </div>

                        <h1
                          className={
                            isDone
                              ? "text-2xl font-black leading-tight text-muted line-through decoration-primary/45 decoration-2 sm:text-3xl lg:text-4xl"
                              : "text-2xl font-black leading-tight text-foreground sm:text-3xl lg:text-4xl"
                          }
                        >
                          {task.title}
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                          {isDone
                            ? "این یکی از ذهنت سبک شد؛ اگر لازم بود، هنوز می‌توانی برگردی و ویرایشش کنی."
                            : "این وظیفه هنوز روی میزته؛ هر وقت انجام شد، همین‌جا تیکش بزن تا از ذهنت سبک بشه."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
                      >
                        <Edit2 className="size-4" />
                        ویرایش وظیفه
                      </Link>

                      <DeleteTaskButton taskId={task.id} redirectTo="/tasks" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoTile
                      icon={<CheckCircle2 className="size-4" />}
                      label="وضعیت"
                      value={<TaskStatusBadge status={task.status} size="md" />}
                    />

                    <InfoTile
                      icon={<Sparkles className="size-4" />}
                      label="اولویت"
                      value={
                        <TaskPriorityBadge priority={task.priority} size="md" />
                      }
                    />

                    <InfoTile
                      icon={<Folder className="size-4" />}
                      label="دسته‌بندی"
                      value={
                        task.category ? (
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-black text-white shadow-sm"
                            style={{ background: task.category.color }}
                          >
                            {task.category.name}
                          </span>
                        ) : (
                          <span className="text-sm font-black text-muted">
                            بدون دسته‌بندی
                          </span>
                        )
                      }
                    />
                  </div>

                  {task.description ? (
                    <section className="mt-6 rounded-4xl border border-border bg-background/65 p-5 shadow-inner sm:p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
                          <Feather className="size-4" />
                        </span>

                        <div>
                          <h2 className="text-sm font-black text-foreground">
                            توضیحات وظیفه
                          </h2>
                          <p className="mt-1 text-xs text-muted">
                            چیزهایی که برای انجامش لازم داری.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-card/70 p-4 text-sm leading-8 text-foreground">
                        <RenderEntryContent content={task.description} />
                      </div>
                    </section>
                  ) : (
                    <section className="mt-6 rounded-4xl border border-dashed border-border bg-background/55 p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
                          <Feather className="size-4" />
                        </span>

                        <div>
                          <h2 className="text-sm font-black text-foreground">
                            توضیحی برای این وظیفه ننوشتی
                          </h2>
                          <p className="mt-1 text-xs leading-6 text-muted">
                            اگر جزئیات بیشتری لازم دارد، می‌توانی از بخش ویرایش
                            اضافه‌اش کنی.
                          </p>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </section>
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <MetaCard task={task} />

              <SideNote
                icon={<CheckCircle2 className="size-5" />}
                title={isDone ? "این کار تمام شده" : "هنوز روی میزته"}
                subtitle={
                  isDone ? "یک چیز کمتر برای فکر کردن" : "آرام و یکی‌یکی"
                }
                text={
                  isDone
                    ? "انجامش دادی و از ذهنت سبک شد. همین قدم‌های کوچک‌اند که دفتر را مرتب‌تر می‌کنند."
                    : "لازم نیست همه کارها یک‌جا تمام شوند؛ فقط همین یکی را واضح نگه دار و قدم بعدی را بردار."
                }
              />

              <DailyVerseCard />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TaskDetailHero({
  task,
  isDone,
}: {
  task: NonNullable<Awaited<ReturnType<typeof getUserTaskById>>>;
  isDone: boolean;
}) {
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
              بازگشت به دفتر وظایف
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              {isDone ? "یک کار انجام‌شده" : "یک کار منتظر انجام"}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {isDone ? "از ذهنت سبک شد" : "این یکی هنوز روی میزته"}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              جزئیات این وظیفه را اینجا نگه دار؛ نه برای فشار، برای اینکه ذهنت
              خلوت‌تر بماند.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniHeroStat
              icon={<CheckCircle2 className="size-4" />}
              label="وضعیت"
              text={isDone ? "انجام شده" : "در جریان"}
            />

            <MiniHeroStat
              icon={<CalendarClock className="size-4" />}
              label="موعد"
              text={task.dueAt ? formatJalaliDate(task.dueAt) : "بدون تاریخ"}
            />

            <MiniHeroStat
              icon={<Sparkles className="size-4" />}
              label="اهمیت"
              text="اولویت مشخص شده"
            />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/82 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">کارت وظیفه</p>
                <p className="mt-1 text-lg font-black text-foreground">
                  قدم بعدی روشن
                </p>
              </div>

              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
                <CheckCircle2 className="size-5" />
              </span>
            </div>

            <div className="space-y-3">
              <HeroPrompt text="عنوانش مشخصه" />
              <HeroPrompt text="وضعیتش معلومه" />
              <HeroPrompt text="جاش توی دفتر پیدا شده" />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Feather className="mb-2 size-4 text-gold" />
              <p className="text-sm leading-7 text-muted">
                گاهی فقط همین که کار از ذهن بیاد روی صفحه، نصف راهه.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-background/62 p-4">
      <div className="pointer-events-none absolute -left-10 -top-10 size-24 rounded-full bg-gold/10 blur-2xl" />

      <div className="relative flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold text-muted">{label}</p>
          <div className="mt-2">{value}</div>
        </div>
      </div>
    </div>
  );
}

function MetaCard({
  task,
}: {
  task: NonNullable<Awaited<ReturnType<typeof getUserTaskById>>>;
}) {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-gold/12 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark">
            <Clock3 className="size-5" />
          </span>

          <div>
            <h3 className="text-sm font-black text-foreground">
              زمان‌های این وظیفه
            </h3>
            <p className="mt-1 text-xs text-muted">رد کوچک این کار در دفترت</p>
          </div>
        </div>

        <div className="space-y-3">
          {task.dueAt && (
            <MetaRow
              icon={<CalendarClock className="size-4" />}
              label="موعد انجام"
              value={formatJalaliDateTime(task.dueAt)}
              strong
            />
          )}

          <MetaRow
            icon={<Feather className="size-4" />}
            label="ساخته‌شده"
            value={formatJalaliDate(task.createdAt)}
          />

          {task.completedAt && (
            <MetaRow
              icon={<CheckCircle2 className="size-4" />}
              label="انجام‌شده"
              value={formatJalaliDateTime(task.completedAt)}
              strong
            />
          )}

          {!task.dueAt && !task.completedAt && (
            <MetaRow
              icon={<TimerReset className="size-4" />}
              label="زمان"
              value="فعلاً بدون موعد مشخص"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function MetaRow({
  icon,
  label,
  value,
  strong,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/65 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        {icon}
      </span>

      <div>
        <p className="text-[11px] font-bold text-muted">{label}</p>
        <p
          className={
            strong
              ? "mt-1 text-sm font-black text-foreground"
              : "mt-1 text-sm font-bold text-foreground"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SideNote({
  icon,
  title,
  subtitle,
  text,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  text: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-primary-soft/18 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
            {icon}
          </span>

          <div>
            <h3 className="text-sm font-black text-foreground">{title}</h3>
            <p className="mt-1 text-xs text-muted">{subtitle}</p>
          </div>
        </div>

        <p className="rounded-2xl bg-background/65 p-4 text-sm leading-7 text-muted">
          {text}
        </p>
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
