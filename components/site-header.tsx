"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { khalvatLogo } from "@/lib/branding";

import {
  Bell,
  CalendarDays,
  ChevronLeft,
  FileText,
  Heart,
  Laugh,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Repeat2,
  Target,
  ChartNoAxesCombined,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/avatar/user-avatar";

interface SiteHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  userAvatarIcon?: string | null;
  userAvatarColor?: string | null;
  isAdmin?: boolean;
}

const ITEMS = [
  ["/today", "امروز", Sun, 1],
  ["/dashboard", "داشبورد", LayoutDashboard, 0],
  ["/calendar", "تقویم", CalendarDays, 1],
  ["/tasks", "وظایف", ListTodo, 1],
  ["/entries", "نوشته‌ها", FileText, 1],
  ["/reminders", "یادآورها", Bell, 0],
  ["/gratitude", "شکرگزاری", Heart, 0],
  ["/check-ins", "حال‌نگار", Laugh, 0],
  ["/habits", "عادت‌ها", Repeat2, 0],
  ["/goals", "هدف‌ها", Target, 0],
  ["/stats", "آمار و روند", ChartNoAxesCombined, 0],
] as const;

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

function NavItem({
  item,
  close,
}: {
  item: (typeof ITEMS)[number];
  close?: () => void;
}) {
  const pathname = usePathname();
  const [href, label, Icon] = item;
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={close}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-11 items-center justify-between rounded-xl px-3 text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "bg-primary/10 text-primary-dark font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-none"
          : "text-muted hover:bg-muted/10 hover:text-foreground active:scale-[0.98]",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
            active
              ? "bg-primary text-white shadow-sm shadow-primary/30"
              : "bg-muted/10 text-muted group-hover:bg-muted/20 group-hover:text-foreground",
          )}
        >
          <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
        </span>
        <span className="truncate">{label}</span>
      </div>

      {active ? (
        <span className="size-1.5 rounded-full bg-primary" />
      ) : (
        <ChevronLeft className="size-3.5 opacity-0 transition-all duration-200 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0" />
      )}
    </Link>
  );
}

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 pb-2 pt-2 text-[11px] font-bold text-muted/60">
      <span>{children}</span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}

export function SiteHeader({
  userName,
  userAvatarIcon,
  userAvatarColor,
  isAdmin,
}: SiteHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* دسکتاپ */}
      <aside className="fixed inset-y-4 right-4 z-40 hidden w-64 flex-col rounded-3xl border border-white/40 dark:border-white/5 bg-card/80 p-3.5 shadow-2xl backdrop-blur-2xl lg:flex">
        {/* گرادینت‌های پس‌زمینه */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-amber-500/10 blur-3xl" />

        {/* لوگو بدون کادر و با سایز بزرگ‌تر */}
        <Link
          href="/today"
          className="mb-5 mt-1 flex items-center justify-center py-2"
        >
          <Image
            src={khalvatLogo}
            unoptimized
            alt="خلوت"
            width={360}
            height={120}
            priority
            className="h-20 w-auto object-contain"
          />
        </Link>

        {/* منو */}
        <nav
          aria-label="منوی اصلی"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto pl-1 pr-0.5 scrollbar-thin"
        >
          <div className="space-y-1">
            <SidebarSectionLabel>برنامه‌ریزی</SidebarSectionLabel>
            {ITEMS.slice(0, 6).map((item) => (
              <NavItem key={item[0]} item={item} />
            ))}
          </div>

          <div className="space-y-1">
            <SidebarSectionLabel>فضای شخصی</SidebarSectionLabel>
            {ITEMS.slice(6).map((item) => (
              <NavItem key={item[0]} item={item} />
            ))}
          </div>
        </nav>

        {/* بخش انتهایی */}
        <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/search"
              className="flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-semibold text-muted transition-colors hover:bg-muted/15 hover:text-foreground"
            >
              <Search className="size-4" />
              <span>جستجو</span>
            </Link>

            <Link
              href="/settings"
              className="flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-semibold text-muted transition-colors hover:bg-muted/15 hover:text-foreground"
            >
              <Settings className="size-4" />
              <span>تنظیمات</span>
            </Link>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex h-9 items-center justify-center gap-2 rounded-xl bg-primary/10 text-xs font-bold text-primary-dark transition-all hover:bg-primary/15"
            >
              <ShieldCheck className="size-4 text-primary" />
              <span>پنل مدیریت</span>
            </Link>
          )}

          <div className="group relative flex items-center justify-between rounded-2xl border border-border/60 bg-background/50 p-2 transition-all hover:border-border hover:bg-background/80">
            <div className="flex min-w-0 items-center gap-2.5">
              <UserAvatar
                icon={userAvatarIcon}
                color={userAvatarColor}
                name={userName}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">
                  {userName || "کاربر خلوت"}
                </p>
                <p className="truncate text-[10px] text-muted">حساب کاربری</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="خروج از حساب"
              className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* هدر موبایل */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <div className="relative mx-auto flex h-12 max-w-5xl items-center justify-between">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="باز کردن منوی اصلی"
            aria-expanded={open}
            className="group flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-card/75 text-muted shadow-sm transition-all hover:border-primary-soft hover:bg-card hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <Menu className="size-5 transition-transform group-hover:scale-105" />
          </button>

          <Link href="/today" className="flex items-center">
            <Image
              src={khalvatLogo}
              unoptimized
              alt="خلوت"
              width={140}
              height={48}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          <span className="size-11" aria-hidden="true" />
        </div>
      </header>

      {/* منوی کشویی موبایل */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          />

          <aside className="absolute inset-y-3 right-3 flex w-[min(88vw,22rem)] flex-col rounded-[2rem] border border-white/20 bg-card/95 p-4 shadow-2xl backdrop-blur-2xl">
            {/* سربرگ موبایل بدون کادر دور لوگو */}
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
              <Link href="/today" onClick={() => setOpen(false)}>
                <Image
                  src={khalvatLogo}
                  unoptimized
                  alt="خلوت"
                  width={140}
                  height={48}
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg bg-muted/10 text-muted hover:bg-muted/20 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              <div className="space-y-1">
                <SidebarSectionLabel>برنامه‌ریزی</SidebarSectionLabel>
                {ITEMS.slice(0, 6).map((item) => (
                  <NavItem
                    key={item[0]}
                    item={item}
                    close={() => setOpen(false)}
                  />
                ))}
              </div>

              <div className="space-y-1">
                <SidebarSectionLabel>فضای شخصی</SidebarSectionLabel>
                {ITEMS.slice(6).map((item) => (
                  <NavItem
                    key={item[0]}
                    item={item}
                    close={() => setOpen(false)}
                  />
                ))}
              </div>
            </nav>

            <div className="mt-4 border-t border-border/60 pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/search"
                  onClick={() => setOpen(false)}
                  className="flex h-9 items-center justify-center gap-2 rounded-xl bg-background/50 text-xs font-semibold text-muted"
                >
                  <Search className="size-4" />
                  <span>جستجو</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex h-9 items-center justify-center gap-2 rounded-xl bg-background/50 text-xs font-semibold text-muted"
                >
                  <Settings className="size-4" />
                  <span>تنظیمات</span>
                </Link>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-2">
                <div className="flex min-w-0 items-center gap-2">
                  <UserAvatar
                    icon={userAvatarIcon}
                    color={userAvatarColor}
                    name={userName}
                    size="sm"
                  />
                  <span className="truncate text-xs font-bold text-foreground">
                    {userName || "کاربر خلوت"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
