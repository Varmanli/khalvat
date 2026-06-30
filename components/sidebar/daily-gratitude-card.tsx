import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

import {
  getTodayKey,
  getUserGratitudeByDate,
  getGratitudeStats,
} from "@/lib/gratitude";
import { formatPersianNumber } from "@/lib/persian-numbers";

export async function DailyGratitudeCard({ userId }: { userId: string }) {
  const today = getTodayKey();
  const [entry, stats] = await Promise.all([
    getUserGratitudeByDate(userId, today),
    getGratitudeStats(userId),
  ]);

  const items = (entry?.items as string[] | null) ?? [];
  const shown = items.slice(0, 2);

  return (
    <section className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <Heart className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-foreground">شکرگزاری امروز</h3>
            <p className="mt-1 text-xs text-muted">
              {stats.currentMonthCount > 0
                ? `${formatPersianNumber(stats.currentMonthCount)} روز این ماه`
                : "هنوز ثبت نشده"}
            </p>
          </div>
        </div>

        <Link
          href="/gratitude"
          className="shrink-0 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary-soft/45 hover:text-primary-dark"
        >
          دفتر
        </Link>
      </div>

      {entry && shown.length > 0 ? (
        <div className="space-y-1.5">
          {shown.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-2xl bg-background/65 px-3 py-2.5 text-sm font-semibold text-foreground"
            >
              <Heart className="mt-0.5 size-3.5 shrink-0 text-gold/70" />
              <span className="line-clamp-1">{item}</span>
            </div>
          ))}
          <Link
            href="/gratitude"
            className="mt-1 block text-center text-xs font-bold text-primary transition-colors hover:text-primary-dark"
          >
            مشاهده امروز ←
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-background/55 p-4">
          <p className="text-sm font-semibold text-foreground">
            امروز هنوز چیزی برای قدردانی ننوشته‌ای.
          </p>
          <Link
            href="/gratitude"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark"
          >
            ثبت شکرگزاری
            <ArrowLeft className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
