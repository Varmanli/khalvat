import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  const [adminUser] = await db
    .select({
      name: users.name,
      avatarIcon: users.avatarIcon,
      avatarColor: users.avatarColor,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return (
    <AppShell
      userName={adminUser?.name}
      userAvatarIcon={adminUser?.avatarIcon}
      userAvatarColor={adminUser?.avatarColor}
      isAdmin={true}
    >
      <div className="relative">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-10 right-0 size-80 rounded-full bg-primary-soft/18 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 size-72 rounded-full bg-gold/8 blur-3xl" />

        <div className="relative space-y-6">
          {/* Hero */}
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-primary"
            >
              <ArrowRight className="size-3.5" />
              داشبورد
            </Link>

            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft/35 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  پنل سبک مدیریت
                </h1>
                <p className="mt-0.5 text-sm text-muted">
                  یک نگاه کوتاه به وضعیت خلوت، کاربران و فعالیت‌های اخیر.
                </p>
              </div>
            </div>
          </div>

          {/* Two-column grid — sidebar right, content left (RTL) */}
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="xl:order-1">
              <AdminSidebar />
            </div>
            <main className="min-w-0 xl:order-2">{children}</main>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
