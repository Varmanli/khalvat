import {
  AlertTriangle,
  FileText,
  Flame,
  Heart,
  ListTodo,
  Repeat2,
  Activity,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserSettings } from "@/lib/settings";
import { getAccountDeletionPreview } from "@/lib/account-deletion";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { formatPersianNumberWithSeparator } from "@/lib/persian-numbers";

export const metadata = { title: "منطقه خطر — تنظیمات خلوت" };

export default async function DangerSettingsPage() {
  const session = await requireUser();
  const [{ user }, preview] = await Promise.all([
    getUserSettings(session.userId),
    getAccountDeletionPreview(session.userId),
  ]);

  if (!user) return null;

  const isAdmin =
    user.role === "admin" ||
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .includes(user.email);

  const previewItems = [
    { label: "نوشته‌ها", value: preview.entriesCount, icon: FileText },
    { label: "وظایف", value: preview.tasksCount, icon: ListTodo },
    { label: "شکرگزاری‌ها", value: preview.gratitudeCount, icon: Heart },
    { label: "عادت‌ها", value: preview.habitsCount, icon: Repeat2 },
    { label: "ثبت‌های عادت", value: preview.habitLogsCount, icon: Activity },
  ];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger/70">
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-black text-foreground">منطقه خطر</h2>
          <p className="mt-0.5 text-xs text-muted">
            اینجا کارهایی قرار دارد که روی حساب و داده‌هایت اثر دائمی
            می‌گذارد.
          </p>
        </div>
      </div>

      {/* Data preview card */}
      <div className="overflow-visible rounded-[2.25rem] border border-border bg-linear-to-br from-card via-background to-primary-soft/10 p-6 shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-8">
        <h3 className="mb-1 text-sm font-black text-foreground">
          داده‌هایی که حذف می‌شوند
        </h3>
        <p className="mb-5 text-xs text-muted">
          در صورت حذف حساب، تمام موارد زیر به‌طور دائمی پاک می‌شوند.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previewItems.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3"
            >
              <Icon className="size-4 shrink-0 text-muted" />
              <div className="min-w-0">
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-0.5 text-base font-black text-foreground">
                  {formatPersianNumberWithSeparator(value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account deletion card */}
      <div className="overflow-visible rounded-[2.25rem] border border-danger/25 bg-linear-to-br from-card via-background to-danger/5 p-6 shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-8">
        <div className="mb-4 flex items-start gap-3">
          <Flame className="mt-0.5 size-5 shrink-0 text-danger/70" />
          <div>
            <h3 className="text-sm font-black text-foreground">حذف حساب</h3>
            <p className="mt-1 text-xs leading-6 text-muted">
              با حذف حساب، داده‌های شخصی تو از خلوت پاک می‌شود و امکان
              بازگردانی آن وجود ندارد. اگر لازم است چیزی را نگه داری، قبل از
              حذف حساب آن را دستی ذخیره کن.
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-4 rounded-2xl border border-gold/30 bg-gold/8 px-4 py-3 text-xs text-muted">
            چون مدیر سیستم هستی، با حذف حساب دسترسی مدیریت هم حذف می‌شود.
          </div>
        )}

        <DeleteAccountDialog
          hasPassword={!!user.passwordHash}
          userEmail={user.email}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
