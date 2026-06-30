import { MOOD_META, type EntryMood } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MoodBadgeProps {
  mood: EntryMood;
  className?: string;
}

export function MoodBadge({ mood, className }: MoodBadgeProps) {
  const meta = MOOD_META[mood];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  );
}
