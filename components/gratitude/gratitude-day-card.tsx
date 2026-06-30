import Link from "next/link";
import { Heart } from "lucide-react";
import { formatJalaliDate } from "@/lib/date";
import type { GratitudeEntry } from "@/db/schema";

interface GratitudeDayCardProps {
  entry: GratitudeEntry;
}

export function GratitudeDayCard({ entry }: GratitudeDayCardProps) {
  const items = entry.items as string[];
  const shown = items.slice(0, 2);
  const more = items.length - 2;

  return (
    <Link
      href={`/gratitude?date=${entry.date}`}
      className="group block rounded-2xl border border-border bg-background/60 p-3.5 transition-all duration-200 hover:border-primary-soft hover:bg-card"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
          <Heart className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-muted">
            {formatJalaliDate(new Date(entry.date))}
          </p>
          <div className="mt-0.5 space-y-0.5">
            {shown.map((item, i) => (
              <p key={i} className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary-dark">
                {item}
              </p>
            ))}
            {more > 0 && (
              <p className="text-xs text-muted">+{more} مورد دیگر</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
