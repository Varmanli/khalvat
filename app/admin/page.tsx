import {
  Activity,
  CheckCircle,
  Database,
  FileText,
  Heart,
  ListTodo,
  Repeat2,
  RotateCcw,
  User,
  Users,
  UserCheck,
  UserPlus,
  Zap,
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminActivityItem } from "@/components/admin/admin-activity-item";
import { UserAvatar } from "@/components/avatar/user-avatar";
import {
  requireAdmin,
  getAdminOverviewStats,
  getAdminRecentUsers,
  getAdminRecentActivity,
  getAdminSystemHealth,
} from "@/lib/admin";
import { formatPersianDate } from "@/lib/date";
import { formatPersianNumberWithSeparator } from "@/lib/persian-numbers";

export const metadata = { title: "مدیریت — خلوت" };

export default async function AdminPage() {
  await requireAdmin();

  const [stats, recentUsers, activity, health] = await Promise.all([
    getAdminOverviewStats(),
    getAdminRecentUsers(8),
    getAdminRecentActivity(10),
    getAdminSystemHealth(),
  ]);

  const primaryStats = [
    { icon: Users, label: "کاربران کل", value: stats.totalUsers, tone: "primary" as const },
    { icon: UserPlus, label: "کاربران جدید امروز", value: stats.newUsersToday, tone: "gold" as const },
    { icon: UserPlus, label: "کاربران جدید این هفته", value: stats.newUsersThisWeek, tone: "default" as const },
    { icon: UserCheck, label: "کاربران فعال امروز", value: stats.activeUsersToday, tone: "olive" as const },
    { icon: UserCheck, label: "کاربران فعال ۷ روز", value: stats.activeUsersLast7Days, tone: "default" as const },
    { icon: FileText, label: "نوشته‌ها", value: stats.totalEntries, tone: "default" as const },
    { icon: ListTodo, label: "وظایف", value: stats.totalTasks, tone: "default" as const },
    { icon: Heart, label: "شکرگزاری‌ها", value: stats.totalGratitude, tone: "rose" as const },
    { icon: Repeat2, label: "عادت‌ها", value: stats.totalHabits, tone: "default" as const },
    { icon: Activity, label: "ثبت‌های عادت", value: stats.totalHabitLogs, tone: "default" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
        {primaryStats.map(({ icon, label, value, tone }) => (
          <AdminStatCard key={label} icon={icon} label={label} value={value} tone={tone} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <AdminSectionCard
          title="کاربران اخیر"
          subtitle="آخرین ثبت‌نام‌ها"
          actionLabel="همه کاربران"
          actionHref="/admin/users"
        >
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-2xl bg-background/70 px-4 py-3"
              >
                <UserAvatar
                  icon={u.avatarIcon}
                  color={u.avatarColor}
                  name={u.name}
                  size="sm"
                  subtle
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {u.name}
                  </p>
                  <p className="truncate text-xs text-muted">{u.email}</p>
                </div>
                <div className="shrink-0 text-left">
                  <span
                    className={
                      u.role === "admin"
                        ? "rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white"
                        : "rounded-full bg-card-soft px-2 py-0.5 text-[10px] font-semibold text-muted"
                    }
                  >
                    {u.role === "admin" ? "مدیر" : "کاربر"}
                  </span>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {formatPersianDate(u.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AdminSectionCard>

        {/* Recent activity */}
        <AdminSectionCard
          title="فعالیت‌های اخیر"
          subtitle="آخرین رویدادها (بدون محتوای خصوصی)"
          actionLabel="همه فعالیت‌ها"
          actionHref="/admin/activity"
        >
          <div className="space-y-1.5">
            {activity.length === 0 ? (
              <p className="text-xs text-muted">فعالیتی ثبت نشده.</p>
            ) : (
              activity.map((item) => (
                <AdminActivityItem key={`${item.type}-${item.id}`} item={item} compact />
              ))
            )}
          </div>
        </AdminSectionCard>
      </div>

      {/* System health */}
      <AdminSectionCard title="سلامت سیستم" subtitle="وضعیت کلی خلوت">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthCard
            icon={Database}
            label="وضعیت دیتابیس"
            value={health.databaseStatus === "connected" ? "متصل" : "قطع"}
            ok={health.databaseStatus === "connected"}
          />
          <HealthCard
            icon={User}
            label="آخرین کاربر"
            value={health.lastUser ? health.lastUser.name : "—"}
            sub={
              health.lastUser
                ? formatPersianDate(health.lastUser.createdAt)
                : undefined
            }
          />
          <HealthCard
            icon={RotateCcw}
            label="آخرین فعالیت"
            value={health.lastActivityAt ? formatPersianDate(health.lastActivityAt) : "—"}
          />
          <HealthCard
            icon={CheckCircle}
            label="حالت ثبت‌نام"
            value={health.signupMode === "open" ? "فعال" : "بسته"}
            ok={health.signupMode === "open"}
          />
        </div>
      </AdminSectionCard>
    </div>
  );
}

function HealthCard({
  icon: Icon,
  label,
  value,
  sub,
  ok,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3.5">
      <Icon
        className={
          ok === true
            ? "mt-0.5 size-4 shrink-0 text-success"
            : ok === false
              ? "mt-0.5 size-4 shrink-0 text-danger"
              : "mt-0.5 size-4 shrink-0 text-muted"
        }
      />
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-black text-foreground">{value}</p>
        {sub && <p className="text-[10px] text-muted">{sub}</p>}
      </div>
    </div>
  );
}
