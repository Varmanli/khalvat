"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Lock, SlidersHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/avatar/user-avatar";

interface SettingsSidebarProps {
  userName?: string | null;
  userEmail?: string | null;
  userAvatarIcon?: string | null;
  userAvatarColor?: string | null;
}

const NAV_ITEMS = [
  {
    href: "/settings/profile",
    label: "پروفایل",
    description: "نام، ایمیل و آواتار",
    icon: User,
  },
  {
    href: "/settings/security",
    label: "امنیت",
    description: "تغییر رمز عبور",
    icon: Lock,
  },
  {
    href: "/settings/preferences",
    label: "ترجیحات",
    description: "تجربه روزانه خلوت",
    icon: SlidersHorizontal,
  },
  {
    href: "/settings/danger",
    label: "منطقه خطر",
    description: "کارهای حساس حساب",
    icon: AlertTriangle,
  },
];

export function SettingsSidebar({
  userName,
  userEmail,
  userAvatarIcon,
  userAvatarColor,
}: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="xl:sticky xl:top-28 xl:self-start">
      {/* Mobile: horizontal scroll tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
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

      {/* Desktop: full sidebar card */}
      <div className="relative hidden overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_18px_70px_rgba(94,58,47,0.07)] xl:block">
        {/* Warm blob decorations */}
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gold/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-6 size-24 rounded-full bg-primary-soft/30 blur-3xl" />

        <div className="relative p-5">
          {/* User mini-card */}
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-linear-to-br from-primary-dark via-primary to-[#A56A4B] p-3.5 text-white">
            <UserAvatar
              icon={userAvatarIcon}
              color={userAvatarColor}
              name={userName}
              size="sm"
              className="ring-2 ring-white/25"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{userName || "کاربر"}</p>
              <p className="truncate text-[11px] text-white/65">{userEmail}</p>
            </div>
          </div>

          {/* Label */}
          <p className="mb-3 px-1 text-[11px] font-black uppercase tracking-wider text-muted">
            فهرست تنظیمات
          </p>

          {/* Nav items */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map(({ href, label, description, icon: Icon }) => {
              const active = pathname === href;
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
