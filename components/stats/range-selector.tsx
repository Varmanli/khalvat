import Link from "next/link";

import { cn } from "@/lib/utils";
import type { StatsRangeValue } from "@/lib/statistics";

const ranges: Array<[StatsRangeValue, string]> = [
  ["week", "هفته"],
  ["month", "ماه"],
  ["3m", "۳ ماه"],
  ["6m", "۶ ماه"],
  ["year", "سال"],
  ["all", "همه"],
];

interface StatsRangeSelectorProps {
  value: StatsRangeValue;
  className?: string;
}

export function StatsRangeSelector({
  value,
  className,
}: StatsRangeSelectorProps) {
  return (
    <nav
      aria-label="بازه زمانی آمار"
      className={cn(
        "inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-background/60 p-1 shadow-sm backdrop-blur-sm scrollbar-none",
        className,
      )}
    >
      {ranges.map(([key, label]) => {
        const active = value === key;

        return (
          <Link
            key={key}
            href={`/stats?range=${key}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative shrink-0 rounded-xl px-3.5 py-2 text-xs font-black transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              active
                ? "bg-card text-primary-dark shadow-[0_4px_14px_rgba(94,58,47,0.08)]"
                : "text-muted hover:bg-card/70 hover:text-foreground",
            )}
          >
            {label}

            {active && (
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
