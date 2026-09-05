import Link from "next/link";
import Image from "next/image";
import { getJalaliParts } from "@/lib/date";
import { formatPersianNumber } from "@/lib/persian-numbers";

const QUICK_LINKS = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/entries", label: "همه نوشته‌ها" },
  { href: "/entries/new", label: "نوشته جدید" },
  { href: "/reminders", label: "یادآورها" },
  { href: "/tasks", label: "وظایف" },
  { href: "/gratitude", label: "شکرگزاری" },
  { href: "/check-ins", label: "حال‌نگار" },
  { href: "/search", label: "جستجو" },
];

const MOOD_CHIPS = [
  { label: "آرام", cls: "bg-[#E8E0D0] text-[#5C5346]" },
  { label: "امیدوار", cls: "bg-[#DDE7C7] text-[#4F6332]" },
  { label: "نوستالژیک", cls: "bg-[#E7D2C2] text-[#6A4635]" },
];

export function SiteFooter() {
  const { jy } = getJalaliParts(new Date());

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-linear-to-b from-[#F3E8D8] via-card-soft to-card">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary-soft/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-gold/12 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="grid grid-cols-1 gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.8fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="inline-flex w-fit transition-transform hover:-translate-y-0.5">
              <Image
                src="/logo.png"
                alt="لوگوی خلوت"
                width={190}
                height={58}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="max-w-xs text-sm leading-7 text-muted">
              خلوت، دفتر دیجیتال شخصی برای فکرها، یادداشت‌ها و جرقه‌های ذهنی.
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {MOOD_CHIPS.map(({ label, cls }) => (
                <span
                  key={label}
                  className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${cls}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-3 text-xs font-black tracking-wide text-primary-dark">
              دسترسی سریع
            </p>
            <nav className="grid grid-cols-2 gap-x-5 gap-y-2">
              {QUICK_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-muted transition-colors duration-150 hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* About copy */}
          <div className="flex flex-col gap-3">
            <p className="mb-0 text-xs font-black tracking-wide text-primary-dark">
              درباره
            </p>
            <p className="text-sm text-muted leading-relaxed">
              جایی برای نوشتن بدون قضاوت. هر فکری که ارزش نگه داشتن دارد،
              اینجا امن است.
            </p>
            <p className="text-xs text-muted opacity-70">
              رایگان. شخصی. فقط برای تو.
            </p>
          </div>
        </div>

        {/* Bottom line */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/80 pt-5 sm:flex-row">
          <p className="text-xs text-muted">
            ساخته شده برای نوشتن آرام‌تر.
          </p>
          <p className="rounded-full border border-border/80 bg-card/55 px-3 py-1 text-xs text-muted">
            خلوت — {formatPersianNumber(jy)}
          </p>
        </div>
      </div>
    </footer>
  );
}
