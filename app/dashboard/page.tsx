import { AppShell } from "@/components/app-shell";
import { EntryCard } from "@/components/entry-card";
import { MoodBadge } from "@/components/mood-badge";
import { VerseCard } from "@/components/verse-card";
import { DailyGuideCard } from "@/components/sidebar/daily-guide-card";
import { DailyGratitudeCard } from "@/components/sidebar/daily-gratitude-card";
import { DailyTasksCard } from "@/components/sidebar/daily-tasks-card";
import { DailyRemindersCard } from "@/components/sidebar/daily-reminders-card";
import { DailyVerseCard } from "@/components/sidebar/daily-verse-card";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { EntryMood } from "@/lib/constants";
import { formatPersianNumber } from "@/lib/date";
import { getUserEntries } from "@/lib/entries";
import { getDailyVerse, type DailyVerse } from "@/lib/ganjoor";
import { getUserRecentTags } from "@/lib/tags";
import { isPast } from "@/lib/utils";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CheckSquare,
  Clock3,
  Feather,
  FileText,
  Hash,
  Heart,
  Layers,
  Lightbulb,
  PenLine,
  Pin,
  PlusCircle,
  Quote,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireUser();

  const [userRows, allEntries, recentTags, dailyVerse] = await Promise.all([
    db
      .select({
        name: users.name,
        email: users.email,
        image: users.image,
        avatarIcon: users.avatarIcon,
        avatarColor: users.avatarColor,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),
    getUserEntries(session.userId),
    getUserRecentTags(session.userId, 8),
    getDailyVerse(),
  ]);

  const user = userRows[0];
  const userName = user?.name ?? "";
  const isAdmin =
    user?.role === "admin" ||
    (user?.email
      ? (process.env.ADMIN_EMAILS ?? "")
          .split(",")
          .map((e) => e.trim())
          .includes(user.email)
      : false);

  const pinned = allEntries.filter((entry) => entry.isPinned);
  const recent = allEntries.filter((entry) => !entry.isPinned).slice(0, 10);

  const totalCount = allEntries.length;
  const pinnedCount = pinned.length;
  const ideasCount = allEntries.filter((entry) => entry.type === "idea").length;

  const futureReminderCount = allEntries.filter(
    (entry) => entry.reminderAt && !isPast(entry.reminderAt),
  ).length;

  const recentMoods = [
    ...new Set(allEntries.slice(0, 15).map((entry) => entry.mood)),
  ].slice(0, 3) as EntryMood[];

  const hasMetaContent = recentMoods.length > 0 || recentTags.length > 0;

  const dashboardTips = [
    {
      icon: <PenLine className="size-3.5" />,
      text: "نوشته‌هایت را در بخش اصلی ببین",
    },
    { icon: <Heart className="size-3.5" />, text: "هر روز شکرگزاری ثبت کن" },
    {
      icon: <CheckSquare className="size-3.5" />,
      text: "وظایف امروز و عقب‌افتاده را رصد کن",
    },
    {
      icon: <Bell className="size-3.5" />,
      text: "یادآورهای نزدیک را فراموش نکن",
    },
  ];

  return (
    <AppShell
      userName={userName}
      userAvatarIcon={user?.avatarIcon}
      userAvatarColor={user?.avatarColor}
      isAdmin={isAdmin}
    >
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 left-0 size-72 rounded-full bg-primary-soft/25 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <DeskHero userName={userName} dailyVerse={dailyVerse} />

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="همه نوشته‌ها"
              value={totalCount}
              icon={<FileText className="size-5" />}
              href="/entries"
              description="تمام صفحه‌هایی که تا امروز نوشته‌ای"
            />
            <StatCard
              label="پین‌شده‌ها"
              value={pinnedCount}
              icon={<Pin className="size-5" />}
              href="/entries"
              description="چیزهایی که باید همیشه جلوی چشم بمانند"
            />
            <StatCard
              label="ایده‌ها"
              value={ideasCount}
              icon={<Lightbulb className="size-5" />}
              href="/entries?type=idea"
              description="جرقه‌هایی که شاید یک روز پروژه شوند"
            />
            <StatCard
              label="یادآورها"
              value={futureReminderCount}
              icon={<Bell className="size-5" />}
              href="/reminders"
              description="قرارهای کوچک با خودت"
              highlight={futureReminderCount > 0}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <main className="space-y-7">
              {pinned.length > 0 && (
                <JournalSection
                  icon={<Pin className="size-4" />}
                  title="نوشته‌های پین‌شده"
                  subtitle="صفحه‌هایی که هنوز باید نزدیک بمانند."
                  actionHref="/entries"
                  actionLabel="مدیریت نوشته‌ها"
                >
                  <div className="grid gap-3">
                    {pinned.map((entry) => (
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
                </JournalSection>
              )}

              <JournalSection
                icon={<BookOpen className="size-4" />}
                title="آخرین صفحه‌های خلوت"
                subtitle="رد فکرها، حس‌ها و یادداشت‌هایی که تازه‌ترند."
                actionHref={allEntries.length > 10 ? "/entries" : undefined}
                actionLabel="همه نوشته‌ها"
              >
                {allEntries.length === 0 ? (
                  <EmptyState />
                ) : recent.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-border bg-card p-8 text-center shadow-[0_18px_60px_rgba(94,58,47,0.06)]">
                    <p className="font-semibold text-foreground">
                      همه نوشته‌ها پین شده‌اند.
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      انگار همه صفحه‌ها برایت مهم‌اند؛ بد هم نیست.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {recent.map((entry) => (
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
              </JournalSection>
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <DailyGuideCard
                title="راهنمای این صفحه"
                subtitle="میز فرمان خلوتت"
                tips={dashboardTips}
              />

              <DailyGratitudeCard userId={session.userId} />

              <DailyRemindersCard userId={session.userId} />

              <DailyTasksCard userId={session.userId} />

              {hasMetaContent && (
                <MetaPanel recentMoods={recentMoods} recentTags={recentTags} />
              )}

              <DailyVerseCard />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function DeskHero({
  userName,
  dailyVerse,
}: {
  userName: string;
  dailyVerse: DailyVerse;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.09)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/25" />
      <div className="pointer-events-none absolute -left-16 -top-16 size-60 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-tl-[7rem] bg-primary/10" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-8">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              {userName ? `سلام ${userName}` : "سلام، خوش برگشتی"}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              امروز چی توی ذهنت مونده؟
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              هرچی هست، لازم نیست کامل و مرتب باشه؛ همین‌جا آروم بنویسش تا از
              شلوغی ذهنت بیاد بیرون.
            </p>

            <VerseCard
              verse={dailyVerse}
              variant="inline"
              title="بیت امروز"
              className="mt-6 max-w-md"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/entries/new"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-primary-dark via-primary to-primary px-5 py-3 text-sm font-black text-white shadow-[0_18px_44px_rgba(138,90,68,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(138,90,68,0.34)]"
            >
              <PlusCircle className="size-5" />
              شروع نوشتن
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>

            <Link
              href="/tasks/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/75 px-5 py-3 text-sm font-black text-foreground shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-card hover:text-primary-dark"
            >
              <CheckSquare className="size-5 text-olive" />
              افزودن وظیفه
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/80 p-5 shadow-[0_18px_60px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">دفتر امروز</p>
                <p className="mt-1 text-lg font-black text-foreground">
                  صفحه خلوت
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <Feather className="size-5" />
              </div>
            </div>

            <div className="space-y-3">
              <PaperLine
                icon={<PenLine className="size-4" />}
                text="یک جمله کوتاه بنویس"
              />
              <PaperLine
                icon={<Lightbulb className="size-4" />}
                text="جرقه را قبل از فراموشی نگه دار"
              />
              <PaperLine
                icon={<Bell className="size-4" />}
                text="اگر لازم بود، یادآور بگذار"
              />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Quote className="mb-2 size-4 text-gold" />
              <p className="text-sm leading-7 text-muted">
                هر جمله‌ای که می‌نویسی، کمی از شلوغی ذهنت کم می‌کنه.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaperLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/55 px-3 py-3 text-sm font-semibold text-foreground">
      <span className="flex size-9 items-center justify-center rounded-xl bg-card-soft text-primary">
        {icon}
      </span>
      {text}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
  description,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[1.65rem] border border-border bg-card p-4 shadow-[0_16px_50px_rgba(94,58,47,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_24px_70px_rgba(94,58,47,0.1)]"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          highlight ? "bg-warning" : "bg-primary-soft"
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex size-11 items-center justify-center rounded-2xl ${
            highlight
              ? "bg-warning/12 text-warning"
              : "bg-primary-soft/45 text-primary-dark"
          }`}
        >
          {icon}
        </div>

        <div className="text-left">
          <div className="text-3xl font-black text-foreground">
            {formatPersianNumber(value)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-black text-foreground">{label}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
          {description}
        </p>
      </div>
    </Link>
  );
}

function JournalSection({
  icon,
  title,
  subtitle,
  actionHref,
  actionLabel,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-4xl border border-border bg-card/72 p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
            {icon}
          </span>
          <div>
            <h2 className="text-base font-black text-foreground">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p>
          </div>
        </div>

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 self-start rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:border-primary-soft hover:bg-primary-soft/40 hover:text-primary-dark"
          >
            {actionLabel}
            <ArrowLeft className="size-3.5" />
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}

function MetaPanel({
  recentMoods,
  recentTags,
}: {
  recentMoods: EntryMood[];
  recentTags: Array<{ id: string; name: string; slug: string }>;
}) {
  if (recentMoods.length === 0 && recentTags.length === 0) return null;

  return (
    <section className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-card-soft text-primary">
          <Layers className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-black text-foreground">رد حال‌وهوا</h3>
          <p className="mt-1 text-xs text-muted">
            چیزهایی که این روزها تکرار شده‌اند.
          </p>
        </div>
      </div>

      {recentMoods.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-muted">حال‌وهوای اخیر</p>
          <div className="flex flex-wrap gap-2">
            {recentMoods.map((mood) => (
              <MoodBadge key={mood} mood={mood} />
            ))}
          </div>
        </div>
      )}

      {recentTags.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted">
            <Hash className="size-3.5" />
            تگ‌های اخیر
          </p>

          <div className="flex flex-wrap gap-2">
            {recentTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/entries?tag=${encodeURIComponent(tag.slug)}`}
                className="rounded-full bg-card-soft px-3 py-1 text-xs font-bold text-muted transition-colors hover:bg-primary-soft hover:text-primary-dark"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-4xl border border-dashed border-border bg-card p-8 text-center shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-12">
      <div className="pointer-events-none absolute -left-14 -top-14 size-44 rounded-full bg-primary-soft/20 blur-3xl" />

      <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-card-soft text-primary">
        <FileText className="size-7" />
      </div>

      <p className="relative text-lg font-black text-foreground">
        هنوز چیزی ننوشتی
      </p>

      <p className="relative mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
        خلوتت منتظر اولین صفحه است؛ یک جمله کوتاه هم برای شروع کافی‌ست.
      </p>

      <Link
        href="/entries/new"
        className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(138,90,68,0.24)] transition-all duration-200 hover:bg-primary-dark"
      >
        <PenLine className="size-4" />
        اولین نوشته را بساز
      </Link>
    </div>
  );
}
