import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CircleX,
  FileText,
  Goal,
  ListTodo,
  Repeat2,
  Search,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";

import { requireUser } from "@/lib/auth";
import { formatJalaliDate } from "@/lib/date";
import { htmlToPlainText } from "@/lib/html-utils";
import { formatPersianNumber } from "@/lib/persian-numbers";

import {
  getGlobalSearch,
  normalizePersianSearch,
  searchTypes,
  type SearchType,
} from "@/lib/search";

export const metadata = {
  title: "جستجو — خلوت",
};

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
  }>;
};

const labels: Record<SearchType, string> = {
  all: "همه",
  entries: "نوشته‌ها",
  tasks: "وظایف",
  reminders: "یادآورها",
  goals: "هدف‌ها",
  habits: "عادت‌ها",
};

export default async function SearchPage({ searchParams }: Props) {
  const user = await requireUser();

  const params = await searchParams;

  const query = normalizePersianSearch(
    typeof params.q === "string" ? params.q : "",
  );

  const type = searchTypes.includes(params.type as SearchType)
    ? (params.type as SearchType)
    : "all";

  const data = await getGlobalSearch(user.userId, query);

  const groups = [
    {
      key: "entries" as const,
      icon: FileText,
      items: data.entries,
    },
    {
      key: "tasks" as const,
      icon: ListTodo,
      items: data.tasks,
    },
    {
      key: "reminders" as const,
      icon: Bell,
      items: data.reminders,
    },
    {
      key: "goals" as const,
      icon: Goal,
      items: data.goals,
    },
    {
      key: "habits" as const,
      icon: Repeat2,
      items: data.habits,
    },
  ];

  const count = groups.reduce((sum, group) => sum + group.items.length, 0);

  const selectedCount =
    type === "all"
      ? count
      : (groups.find((group) => group.key === type)?.items.length ?? 0);

  return (
    <AppShell>
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 left-0 size-72 rounded-full bg-primary-soft/25 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-32 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl space-y-6 lg:space-y-8">
          <SearchHero query={query} type={type} resultCount={count} />

          {!query ? (
            <InitialState />
          ) : (
            <>
              <SearchFilters
                query={query}
                type={type}
                count={count}
                groups={groups}
              />

              <section
                aria-live="polite"
                className="rounded-4xl border border-border bg-card/72 p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-5"
              >
                <div className="mb-5 flex items-start gap-3">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
                    <Search className="size-4" />
                  </span>

                  <div>
                    <h2 className="text-base font-black text-foreground">
                      نتایج جستجو
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-muted">
                      {formatPersianNumber(selectedCount)} نتیجه برای «{query}»
                    </p>
                  </div>
                </div>

                {selectedCount === 0 ? (
                  <NoResults />
                ) : (
                  <div className="space-y-5">
                    {groups
                      .filter((group) => type === "all" || group.key === type)
                      .map((group) =>
                        group.items.length ? (
                          <ResultGroup
                            key={group.key}
                            title={labels[group.key]}
                            icon={<group.icon className="size-4" />}
                          >
                            {group.items.map((item) => (
                              <Result
                                key={item.id}
                                type={group.key}
                                item={item}
                                query={query}
                              />
                            ))}
                          </ResultGroup>
                        ) : null,
                      )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

function SearchHero({
  query,
  type,
  resultCount,
}: {
  query: string;
  type: SearchType;
  resultCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.09)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/25" />

      <div className="pointer-events-none absolute -left-16 -top-16 size-60 rounded-full bg-gold/15 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-tl-[7rem] bg-primary/10" />

      <div className="relative p-5 sm:p-7 lg:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
          <Sparkles className="size-3.5 text-gold" />
          خلوتت رو پیدا کن
        </div>

        <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
          هر چیزی که
          <span className="mx-2 text-primary-dark">یادت مونده</span>
          پیدا کن
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          بین نوشته‌ها، وظیفه‌ها، یادآورها، هدف‌ها و عادت‌هات بگرد؛ بدون اینکه
          بین صفحه‌های مختلف بچرخی.
        </p>

        <form
          role="search"
          action="/search"
          className="relative mt-7 max-w-3xl"
        >
          <label className="sr-only" htmlFor="q">
            عبارت جستجو
          </label>

          <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-primary" />

          <input
            id="q"
            name="q"
            defaultValue={query}
            autoFocus
            className="h-14 w-full rounded-2xl border border-border bg-background/70 py-3 pr-12 pl-14 text-sm font-bold text-foreground shadow-sm outline-none transition placeholder:text-muted/70 hover:border-primary-soft focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary-soft/30"
            placeholder="مثلاً اسم یک نوشته، هدف یا وظیفه..."
          />

          <input type="hidden" name="type" value={type} />

          {query && (
            <Link
              href="/search"
              aria-label="پاک کردن جستجو"
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted transition-colors hover:bg-card-soft hover:text-primary"
            >
              <CircleX className="size-4" />
            </Link>
          )}
        </form>

        {query && (
          <p className="mt-3 text-xs font-bold text-muted">
            {formatPersianNumber(resultCount)} نتیجه پیدا شد
          </p>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  FILTERS                                   */
/* -------------------------------------------------------------------------- */

function SearchFilters({
  query,
  type,
  count,
  groups,
}: {
  query: string;
  type: SearchType;
  count: number;
  groups: Array<{
    key: Exclude<SearchType, "all">;
    items: Array<unknown>;
  }>;
}) {
  const filters = [
    {
      key: "all" as SearchType,
      count,
    },
    ...groups.map((group) => ({
      key: group.key,
      count: group.items.length,
    })),
  ];

  return (
    <nav
      aria-label="فیلتر نتایج"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-background/55 p-1 shadow-sm scrollbar-none"
    >
      {filters.map((filter) => {
        const active = type === filter.key;

        return (
          <Link
            key={filter.key}
            href={`/search?q=${encodeURIComponent(query)}&type=${filter.key}`}
            aria-current={active ? "page" : undefined}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition-all",
              active
                ? "bg-card text-primary-dark shadow-sm"
                : "text-muted hover:bg-card/70 hover:text-foreground",
            ].join(" ")}
          >
            {labels[filter.key]}

            <span
              className={[
                "rounded-full px-1.5 py-0.5 text-[10px]",
                active
                  ? "bg-primary-soft/55 text-primary-dark"
                  : "bg-card-soft text-muted",
              ].join(" ")}
            >
              {formatPersianNumber(filter.count)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                               RESULT GROUP                                 */
/* -------------------------------------------------------------------------- */

function ResultGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft/45 text-primary-dark">
          {icon}
        </span>

        <h3 className="text-xs font-black text-muted">{title}</h3>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-background/45">
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   RESULT                                   */
/* -------------------------------------------------------------------------- */

function Result({
  type,
  item,
  query,
}: {
  type: SearchType;

  item: {
    id: string;
    title: string;
    content?: string;
    description?: string | null;
    createdAt?: Date;
    progress?: number;
    repeatType?: string;
    goal?: {
      title: string;
    } | null;
  };

  query: string;
}) {
  const href =
    type === "entries" || type === "reminders"
      ? `/entries/${item.id}`
      : type === "tasks"
        ? `/tasks/${item.id}`
        : type === "goals"
          ? `/goals/${item.id}`
          : `/habits/${item.id}`;

  const snippet =
    type === "entries" || type === "reminders"
      ? htmlToPlainText(item.content ?? "").slice(0, 150)
      : type === "tasks"
        ? (item.description ?? "وظیفه")
        : type === "goals"
          ? `${formatPersianNumber(Math.round(item.progress ?? 0))}٪ پیشرفت`
          : item.repeatType === "daily"
            ? "هر روز"
            : "عادت هفتگی";

  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-4 border-b border-border/70 p-4 transition-colors last:border-0 hover:bg-card"
    >
      <div className="min-w-0">
        <p className="text-sm font-black text-foreground transition-colors group-hover:text-primary-dark">
          <Highlight text={item.title} query={query} />
        </p>

        <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted">
          <Highlight text={snippet} query={query} />
        </p>

        {(type === "entries" || type === "reminders") && item.createdAt && (
          <p className="mt-2 text-[10px] font-bold text-muted">
            {formatJalaliDate(item.createdAt)}
          </p>
        )}

        {type === "tasks" && item.goal && (
          <p className="mt-2 text-[10px] font-bold text-muted">
            هدف: {item.goal.title}
          </p>
        )}
      </div>

      <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-muted transition-all group-hover:bg-primary-soft/45 group-hover:text-primary-dark">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 HIGHLIGHT                                  */
/* -------------------------------------------------------------------------- */

function Highlight({ text, query }: { text: string; query: string }) {
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const parts = text.split(new RegExp(`(${safe})`, "ig"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLocaleLowerCase("fa").includes(query.toLocaleLowerCase("fa")) ? (
          <mark key={index} className="rounded-md bg-gold/20 px-1 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                               INITIAL STATE                                */
/* -------------------------------------------------------------------------- */

function InitialState() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-card/72 p-6 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-7">
      <div className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full bg-primary-soft/20 blur-3xl" />

      <div className="relative">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
          <Search className="size-5" />
        </span>

        <h2 className="mt-4 text-lg font-black text-foreground">
          دنبال چی می‌گردی؟
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
          اسم یک نوشته، وظیفه، یادآور، هدف یا عادت رو بنویس؛ بقیه‌ش رو خلوت پیدا
          می‌کنه.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/entries/new"
            className="inline-flex items-center rounded-2xl bg-primary px-4 py-2.5 text-xs font-black text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            نوشته جدید
          </Link>

          <Link
            href="/tasks/new"
            className="inline-flex items-center rounded-2xl border border-border bg-background/65 px-4 py-2.5 text-xs font-black text-muted transition-colors hover:border-primary-soft hover:bg-card-soft hover:text-primary-dark"
          >
            وظیفه جدید
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                NO RESULTS                                  */
/* -------------------------------------------------------------------------- */

function NoResults() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-background/45 px-5 py-10 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-card-soft text-muted">
        <Search className="size-5" />
      </span>

      <p className="mt-4 text-sm font-black text-foreground">چیزی پیدا نشد</p>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-muted">
        عبارت کوتاه‌تر یا متفاوتی امتحان کن، یا فیلتر نتایج رو روی «همه» بذار.
      </p>
    </div>
  );
}
