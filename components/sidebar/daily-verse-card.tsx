import { getDailyVerse } from "@/lib/ganjoor";
import { Quote } from "lucide-react";

export async function DailyVerseCard() {
  const verse = await getDailyVerse();
  if (!verse.text) return null;

  return (
    <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gold/12 blur-2xl" />

      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <Quote className="size-4 text-gold" />
          <p className="text-xs font-bold text-muted">بیت امروز</p>
        </div>

        <div className="rounded-2xl bg-background/65 p-3">
          {verse.text.split("\n").map((line, i) => (
            <p key={i} className="text-sm leading-7 text-foreground">
              {line}
            </p>
          ))}
          {verse.poet && (
            <p className="mt-2 text-right text-xs text-muted">— {verse.poet}</p>
          )}
        </div>
      </div>
    </div>
  );
}
