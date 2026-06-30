import { cn } from "@/lib/utils";
import { formatPersianDate } from "@/lib/date";
import { UserAvatar } from "@/components/avatar/user-avatar";
import {
  Activity,
  FileText,
  Heart,
  ListTodo,
  Repeat2,
} from "lucide-react";
import type { ActivityItem } from "@/lib/admin";

const TYPE_META: Record<
  ActivityItem["type"],
  { label: string; icon: React.ElementType; color: string }
> = {
  entry: { label: "نوشته جدید", icon: FileText, color: "#6F7F9A" },
  task: { label: "وظیفه جدید", icon: ListTodo, color: "#C49A5A" },
  gratitude: { label: "شکرگزاری جدید", icon: Heart, color: "#B7776B" },
  habit: { label: "عادت جدید", icon: Repeat2, color: "#7A8F5A" },
  habitLog: { label: "ثبت عادت", icon: Activity, color: "#9B6B9E" },
};

interface AdminActivityItemProps {
  item: ActivityItem;
  compact?: boolean;
}

export function AdminActivityItem({ item, compact }: AdminActivityItemProps) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-background/70 transition-colors hover:bg-card-soft",
        compact ? "px-3 py-2.5" : "px-4 py-3"
      )}
    >
      {/* Type icon */}
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: meta.color }}
      >
        <Icon size={13} />
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.safeLabel}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
          <span className="shrink-0 rounded-full bg-card-soft px-1.5 py-0.5 text-[10px] font-semibold">
            {meta.label}
          </span>
          <span>·</span>
          <span className="truncate">{item.userName || item.userEmail}</span>
        </div>
      </div>

      {/* Date */}
      <p className="shrink-0 text-[10px] text-muted">
        {formatPersianDate(item.createdAt)}
      </p>
    </div>
  );
}
