import Link from "next/link";
import Image from "next/image";

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
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-linear-to-b from-card-soft to-card">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-10">
        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="inline-flex">
              <Image
                src="/logo.png"
                alt="لوگوی خلوت"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              خلوت، دفتر دیجیتال شخصی برای فکرها، یادداشت‌ها و جرقه‌های ذهنی.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {MOOD_CHIPS.map(({ label, cls }) => (
                <span
                  key={label}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${cls}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              دسترسی سریع
            </p>
            <nav className="flex flex-col gap-1.5">
              {QUICK_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-muted hover:text-primary transition-colors duration-150"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* About copy */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-border">
          <p className="text-xs text-muted">
            ساخته شده برای نوشتن آرام‌تر.
          </p>
          <p className="text-xs text-muted opacity-70">
            خلوت — {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
