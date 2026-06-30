import type { ReactNode } from "react";

export function DailyGuideCard({
  title,
  subtitle,
  tips,
}: {
  title: string;
  subtitle: string;
  tips: { icon: ReactNode; text: string }[];
}) {
  return (
    <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.07)]">
      <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-primary-soft/20 blur-2xl" />

      <div className="relative">
        <div className="mb-3">
          <p className="text-sm font-black text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        </div>

        <div className="space-y-1.5">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl bg-background/65 px-3 py-2 text-xs font-semibold text-muted"
            >
              <span className="shrink-0 text-primary">{tip.icon}</span>
              {tip.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
