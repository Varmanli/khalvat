"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  FileText,
  Heart,
  Laugh,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  PenLine,
  Repeat2,
  Search,
  Settings,
  Sparkles,
  ShieldCheck,
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

const NAV_ITEMS = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/entries", label: "نوشته‌ها", icon: FileText, matchPrefix: true },
  { href: "/reminders", label: "یادآورها", icon: Bell },
  { href: "/tasks", label: "وظایف", icon: ListTodo, matchPrefix: true },
  { href: "/gratitude", label: "شکرگزاری", icon: Heart, matchPrefix: true },
  { href: "/check-ins", label: "حال‌نگار", icon: Laugh, matchPrefix: true },
  { href: "/habits", label: "عادت‌ها", icon: Repeat2, matchPrefix: true },
];

function isActivePath(
  pathname: string,
  href: string,
  exact?: boolean,
  matchPrefix?: boolean,
) {
  if (exact) return pathname === href;
  if (matchPrefix) {
    if (href === "/entries") {
      return (
        pathname === "/entries" ||
        (pathname.startsWith("/entries/") &&
          !pathname.startsWith("/entries/new"))
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  matchPrefix,
  highlight,
  onClick,
  mobile,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  matchPrefix?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href, exact, matchPrefix);

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
          active
            ? "bg-primary text-white shadow-[0_14px_34px_rgba(138,90,68,0.22)]"
            : "text-foreground hover:bg-card-soft",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-xl transition-colors",
              active ? "bg-white/16" : "bg-background",
            )}
          >
            <Icon size={18} />
          </span>
          {label}
        </span>
        {highlight && (
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
            سریع
          </span>
        )}
      </Link>
    );
  }

  if (highlight) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-300",
          active
            ? "bg-primary-dark text-white shadow-[0_14px_32px_rgba(94,58,47,0.24)]"
            : "bg-linear-to-l from-primary-dark via-primary to-[#A56A4B] text-white shadow-[0_12px_28px_rgba(138,90,68,0.22)] hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(138,90,68,0.3)]",
        )}
      >
        <span className="absolute inset-0 bg-linear-to-l from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Icon className="relative size-4" />
        <span className="relative">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
        active
          ? "bg-primary-soft text-primary-dark shadow-sm"
          : "text-muted hover:bg-card hover:text-foreground hover:shadow-sm",
      )}
    >
      <Icon
        className={cn(
          "size-4 transition-colors",
          active ? "text-primary-dark" : "text-muted",
        )}
      />
      <span>{label}</span>
      <span
        className={cn(
          "pointer-events-none absolute inset-x-4 -bottom-0.5 h-px origin-center scale-x-0 rounded-full bg-primary transition-transform duration-200",
          active && "scale-x-100",
        )}
      />
    </Link>
  );
}

function HeaderSearch({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (mobile) return;
    function handleShortcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [mobile]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={submit}
      className={cn("relative", mobile ? "w-full" : "w-full max-w-85")}
    >
      <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="جستجو در خلوت..."
        className={cn(
          "h-11 w-full rounded-2xl border border-border/80 bg-[rgba(247,241,232,0.62)] pr-11 text-sm font-medium text-foreground outline-none transition-all duration-200 placeholder:text-muted focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary-soft/35",
          mobile ? "pl-4" : "pl-14",
        )}
      />
      {!mobile && (
        <kbd className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 select-none items-center rounded-lg border border-border/80 bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted xl:flex">
          ⌘K
        </kbd>
      )}
    </form>
  );
}

function UserMenu({
  userName,
  userEmail,
  userAvatarIcon,
  userAvatarColor,
  isAdmin,
  onLogout,
}: {
  userName?: string | null;
  userEmail?: string | null;
  userAvatarIcon?: string | null;
  userAvatarColor?: string | null;
  isAdmin?: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 p-1.5 transition-all duration-200"
        aria-label="منوی کاربر"
        aria-expanded={open}
      >
        <UserAvatar
          icon={userAvatarIcon}
          color={userAvatarColor}
          name={userName}
          size="md"
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[320px] overflow-hidden rounded-[1.75rem] border border-border/80 bg-[rgba(255,253,248,0.96)] p-2 shadow-[0_28px_80px_rgba(43,37,32,0.18)] backdrop-blur-2xl">
          <div className="relative overflow-hidden rounded-[1.35rem] bg-linear-to-br from-primary-dark via-primary to-[#A56A4B] p-4 text-white">
            <div className="absolute -left-10 -top-10 size-28 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 right-8 size-28 rounded-full bg-gold/25 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <UserAvatar
                icon={userAvatarIcon}
                color={userAvatarColor}
                name={userName}
                size="md"
                className="ring-2 ring-white/30"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-black">
                  {userName || "کاربر خلوت"}
                </p>
                <p className="mt-1 truncate text-xs text-white/70">
                  {userEmail || "دفتر شخصی تو"}
                </p>
              </div>
            </div>
            <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/12 px-3 py-2 text-xs text-white/82">
              <Sparkles className="size-4" />
              <span>امروز هم یک جرقه کوچک را نگه دار.</span>
            </div>
          </div>

          <div className="mt-2 grid gap-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card-soft"
            >
              <LayoutDashboard className="size-4 text-primary" />
              داشبورد من
            </Link>
            <Link
              href="/entries/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card-soft"
            >
              <PenLine className="size-4 text-primary" />
              نوشتن سریع
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card-soft"
            >
              <Settings className="size-4 text-primary" />
              تنظیمات حساب
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card-soft"
              >
                <ShieldCheck className="size-4 text-gold" />
                مدیریت
              </Link>
            )}
          </div>

          <div className="mt-2 border-t border-border/70 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right text-sm font-bold text-danger transition-colors hover:bg-red-50"
            >
              <LogOut className="size-4" />
              خروج از حساب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileUserCard({
  userName,
  userEmail,
  userAvatarIcon,
  userAvatarColor,
}: {
  userName?: string | null;
  userEmail?: string | null;
  userAvatarIcon?: string | null;
  userAvatarColor?: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/75 bg-linear-to-br from-primary-dark via-primary to-[#A56A4B] p-4 text-white shadow-[0_18px_44px_rgba(138,90,68,0.22)]">
      <div className="absolute -left-10 -top-10 size-28 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 right-8 size-28 rounded-full bg-gold/25 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <UserAvatar
          icon={userAvatarIcon}
          color={userAvatarColor}
          name={userName}
          size="md"
          className="ring-2 ring-white/30"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-black">
            {userName || "کاربر خلوت"}
          </p>
          <p className="mt-1 truncate text-xs text-white/72">
            {userEmail || "دفتر شخصی تو"}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({
  userName,
  userEmail,
  userAvatarIcon,
  userAvatarColor,
  isAdmin,
}: SiteHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-[rgba(247,241,232,0.78)] backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5 lg:px-8">
          <div className="relative flex h-18 items-center justify-between gap-3 rounded-[1.85rem] border border-white/55 bg-[rgba(255,253,248,0.74)] px-3 shadow-[0_18px_60px_rgba(94,58,47,0.08)] ring-1 ring-[rgba(138,90,68,0.06)] sm:px-4">
            <div className="pointer-events-none absolute inset-x-10 -bottom-px h-px bg-linear-to-l from-transparent via-[rgba(196,154,90,0.52)] to-transparent" />

            <Link
              href="/dashboard"
              aria-label="داشبورد خلوت"
              className="group relative flex shrink-0 items-center"
            >
              <span className="absolute -inset-2 rounded-3xl bg-primary-soft/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <Image
                src="/logo.png"
                alt="لوگوی خلوت"
                width={220}
                height={64}
                className="relative h-12 w-auto object-contain sm:h-14 lg:h-16"
                priority
              />
            </Link>

            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              <div className="flex items-center gap-1 rounded-3xl border border-border/65 bg-[rgba(247,241,232,0.58)] p-1 shadow-inner">
                {NAV_ITEMS.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </nav>

            <div className="flex min-w-0 items-center justify-end gap-2">
              <div className="hidden xl:block">
                <HeaderSearch />
              </div>

              <Link
                href="/search"
                className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-[rgba(255,253,248,0.7)] text-muted shadow-sm transition-all duration-200 hover:bg-card hover:text-foreground focus:outline-none focus:ring-4 focus:ring-primary-soft/35 xl:hidden"
                aria-label="جستجو"
              >
                <Search className="size-5" />
              </Link>

              <UserMenu
                userName={userName}
                userEmail={userEmail}
                userAvatarIcon={userAvatarIcon}
                userAvatarColor={userAvatarColor}
                isAdmin={isAdmin}
                onLogout={handleLogout}
              />

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-[rgba(255,253,248,0.7)] text-foreground shadow-sm transition-all duration-200 hover:bg-card focus:outline-none focus:ring-4 focus:ring-primary-soft/35 lg:hidden"
                aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="بستن منو"
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="fixed inset-x-3 top-24.5 z-50 overflow-hidden rounded-4xl border border-border/80 bg-[rgba(255,253,248,0.98)] p-3 shadow-[0_28px_90px_rgba(43,37,32,0.22)] backdrop-blur-2xl lg:hidden">
            <MobileUserCard
              userName={userName}
              userEmail={userEmail}
              userAvatarIcon={userAvatarIcon}
              userAvatarColor={userAvatarColor}
            />

            <div className="mt-3">
              <HeaderSearch mobile />
            </div>

            <nav className="mt-3 grid gap-1">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  mobile
                  onClick={() => setMenuOpen(false)}
                />
              ))}
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-card-soft"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-background">
                  <Settings size={18} />
                </span>
                تنظیمات حساب
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-card-soft"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-background">
                    <ShieldCheck size={18} />
                  </span>
                  مدیریت
                </Link>
              )}
            </nav>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
              <Link
                href="/entries/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(138,90,68,0.22)]"
              >
                <PenLine className="size-4" />
                نوشتن
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-danger"
              >
                <LogOut className="size-4" />
                خروج
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
