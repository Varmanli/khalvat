import { ENTRY_TYPE_META, type EntryType } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: EntryType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const meta = ENTRY_TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        "bg-card-soft text-muted",
        className
      )}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

