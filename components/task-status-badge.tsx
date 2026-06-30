import { TASK_STATUS_META, type TaskStatus } from "@/lib/task-constants";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md";
}

export function TaskStatusBadge({ status, size = "sm" }: TaskStatusBadgeProps) {
  const meta = TASK_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{ background: meta.color, color: meta.textColor }}
    >
      {meta.label}
    </span>
  );
}
