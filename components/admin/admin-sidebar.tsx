"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "نمای کلی",
    description: "آمار و خلاصه",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/users",
    label: "کاربران",
    description: "مدیریت کاربران",
    icon: Users,
  },
  {
    href: "/admin/activity",
    label: "فعالیت‌ها",
    description: "فید فعالیت اخیر",
    icon: Activity,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside>
      {/* Mobile horizontal pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "border-primary bg-primary text-white shadow-[0_6px_18px_rgba(138,90,68,0.24)]"
                  : "border-border bg-card text-muted hover:border-primary/40 hover:bg-primary-soft/20 hover:text-primary"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Desktop sidebar */}
      <div className="relative hidden overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_18px_70px_rgba(94,58,47,0.07)] xl:block xl:sticky xl:top-28 xl:self-start">
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gold/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-6 size-24 rounded-full bg-primary-soft/25 blur-3xl" />

        <div className="relative p-5">
          <div className="mb-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-muted">
              پنل مدیریت
            </p>
            <h2 className="mt-1 text-lg font-black text-foreground">مدیریت</h2>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map(({ href, label, description, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex items-start gap-3 rounded-2xl border p-3 transition-all duration-200",
                    active
                      ? "border-primary-soft bg-primary-soft/35 text-primary-dark"
                      : "border-transparent hover:border-border hover:bg-primary-soft/20"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl shadow-[0_2px_8px_rgba(138,90,68,0.10)] transition-colors",
                      active
                        ? "bg-primary text-white"
                        : "bg-background text-primary group-hover:bg-primary-soft/40"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="pt-0.5">
                    <span
                      className={cn(
                        "block text-sm font-black",
                        active ? "text-primary-dark" : "text-foreground"
                      )}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted">
                      {description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
