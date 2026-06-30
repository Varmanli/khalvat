import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin, getAdminUsers } from "@/lib/admin";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { formatPersianDate } from "@/lib/date";
import { formatPersianNumberWithSeparator } from "@/lib/persian-numbers";
import { toPersianDigits } from "@/lib/persian-numbers";

export const metadata = { title: "کاربران — مدیریت خلوت" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requireAdmin();
  const { q, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const { users, total, totalPages } = await getAdminUsers({ q, page });

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجو بر اساس نام یا ایمیل..."
            dir="rtl"
            className="h-12 w-full rounded-2xl border border-border bg-card pr-11 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft/25"
          />
        </form>
      </div>

      {/* Summary */}
      <p className="text-xs text-muted">
        {formatPersianNumberWithSeparator(total)} کاربر پیدا شد
        {q ? ` برای «${q}»` : ""}
      </p>

      {/* Users list */}
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
            کاربری پیدا نشد.
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_4px_18px_rgba(43,37,32,0.04)] sm:flex-row sm:items-center"
            >
              {/* Avatar + identity */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar
                  icon={u.avatarIcon}
                  color={u.avatarColor}
                  name={u.name}
                  size="md"
                  subtle
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">
                    {u.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">{u.email}</p>
                  <p className="mt-1 text-[10px] text-muted">
                    عضو از {formatPersianDate(u.createdAt)}
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="flex flex-wrap gap-2">
                <CountChip label="نوشته" value={u.entriesCount} />
                <CountChip label="وظیفه" value={u.tasksCount} />
                <CountChip label="عادت" value={u.habitsCount} />
                <CountChip label="شکرگزاری" value={u.gratitudeCount} />
              </div>

              {/* Role */}
              <div className="shrink-0">
                <UserRoleSelect
                  userId={u.id}
                  currentRole={u.role ?? "user"}
                  isSelf={u.id === session.userId}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/users?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${p}`}
              className={
                p === page
                  ? "flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-white"
                  : "flex size-9 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-muted hover:bg-card-soft"
              }
            >
              {toPersianDigits(p)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CountChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-background/70 px-2.5 py-1 text-[11px]">
      <span className="font-black text-foreground">
        {toPersianDigits(value)}
      </span>
      <span className="text-muted">{label}</span>
    </span>
  );
}
