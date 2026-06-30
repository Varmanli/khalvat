import { requireAdmin, getAdminRecentActivity } from "@/lib/admin";
import type { ActivityType } from "@/lib/admin";
import { AdminActivityItem } from "@/components/admin/admin-activity-item";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "فعالیت‌ها — مدیریت خلوت" };

const FILTER_TABS: { value: ActivityType; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "entry", label: "نوشته‌ها" },
  { value: "task", label: "وظایف" },
  { value: "gratitude", label: "شکرگزاری" },
  { value: "habit", label: "عادت‌ها" },
  { value: "habitLog", label: "ثبت عادت" },
];

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdmin();
  const { type: rawType } = await searchParams;

  const validTypes: ActivityType[] = ["all", "entry", "task", "gratitude", "habit", "habitLog"];
  const filterType: ActivityType = validTypes.includes(rawType as ActivityType)
    ? (rawType as ActivityType)
    : "all";

  const activity = await getAdminRecentActivity(50, filterType);

  return (
    <div className="space-y-5">
      {/* Privacy note */}
      <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-xs text-muted">
        محتوای خصوصی نوشته‌ها و شکرگزاری‌ها نمایش داده نمی‌شود — فقط عنوان
        ایمن و نوع فعالیت قابل مشاهده است.
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(({ value, label }) => (
          <Link
            key={value}
            href={value === "all" ? "/admin/activity" : `/admin/activity?type=${value}`}
            className={cn(
              "rounded-2xl border px-4 py-2 text-sm font-semibold transition-all",
              filterType === value
                ? "border-primary bg-primary text-white shadow-[0_6px_18px_rgba(138,90,68,0.22)]"
                : "border-border bg-card text-muted hover:border-primary/40 hover:text-primary"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Activity list */}
      <div className="rounded-[2rem] border border-border bg-card shadow-[0_8px_40px_rgba(43,37,32,0.06)]">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-sm font-black text-foreground">
            فعالیت‌های اخیر
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {activity.length > 0
              ? `${activity.length} مورد آخر`
              : "موردی ثبت نشده"}
          </p>
        </div>

        <div className="space-y-1.5 p-4">
          {activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              فعالیتی با این فیلتر پیدا نشد.
            </p>
          ) : (
            activity.map((item) => (
              <AdminActivityItem key={`${item.type}-${item.id}`} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
