import Link from "next/link";
import { CalendarCheck, Heart, Sparkles } from "lucide-react";
import { formatJalaliDate } from "@/lib/date";
import { toPersianDigits } from "@/lib/date";
import type { GratitudeStats } from "@/lib/gratitude";

interface GratitudeStatsProps {
  stats: GratitudeStats;
}

export function GratitudeStatsCard({ stats }: GratitudeStatsProps) {
  return (
    <div className="rounded-[2rem] border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="text-sm font-black text-foreground">رد قدردانی‌ها</p>
          <p className="text-xs text-muted">کوچک، ولی واقعی.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatChip
          icon={<CalendarCheck className="size-4" />}
          label="این ماه"
          value={toPersianDigits(stats.currentMonthCount)}
        />
        <StatChip
          icon={<Heart className="size-4" />}
          label="کل روزها"
          value={toPersianDigits(stats.totalEntries)}
        />
        {stats.currentStreak > 0 && (
          <StatChip
            icon={<Sparkles className="size-4" />}
            label="زنجیره فعلی"
            value={`${toPersianDigits(stats.currentStreak)} روز`}
            wide
          />
        )}
      </div>

      {stats.lastEntryDate && (
        <p className="mt-3 text-[11px] text-muted">
          آخرین ثبت:{" "}
          <span className="font-semibold text-foreground">
            {formatJalaliDate(new Date(stats.lastEntryDate))}
          </span>
        </p>
      )}

      <Link
        href="/gratitude"
        className="mt-4 block w-full rounded-2xl bg-primary-soft/40 py-2.5 text-center text-xs font-black text-primary-dark transition-colors hover:bg-primary-soft/70"
      >
        دفتر شکرگزاری
      </Link>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  wide,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl bg-background/70 p-3 ${wide ? "col-span-2" : ""}`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}
