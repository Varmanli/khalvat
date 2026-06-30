import { TASK_PRIORITY_META, type TaskPriority } from "@/lib/task-constants";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  size?: "sm" | "md";
}

export function TaskPriorityBadge({ priority, size = "sm" }: TaskPriorityBadgeProps) {
  const meta = TASK_PRIORITY_META[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{ background: meta.color, color: meta.textColor }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: meta.dotColor }}
      />
      {meta.label}
    </span>
  );
}
