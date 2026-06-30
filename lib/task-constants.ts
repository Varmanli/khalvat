export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "archived";

export interface PriorityMeta {
  label: string;
  color: string;       // CSS color for badge background
  textColor: string;   // CSS color for badge text
  dotColor: string;    // accent dot / border
}

export const TASK_PRIORITY_META: Record<TaskPriority, PriorityMeta> = {
  low: {
    label: "کم",
    color: "#E8EDD9",
    textColor: "#4F6332",
    dotColor: "#7A8450",
  },
  medium: {
    label: "معمولی",
    color: "#F3E8D0",
    textColor: "#7A4E16",
    dotColor: "#C49A5A",
  },
  high: {
    label: "مهم",
    color: "#FAEBD4",
    textColor: "#8A4A1A",
    dotColor: "#D4742A",
  },
  urgent: {
    label: "فوری",
    color: "#FAE0DC",
    textColor: "#7D2020",
    dotColor: "#B94A48",
  },
};

export interface StatusMeta {
  label: string;
  color: string;
  textColor: string;
}

export const TASK_STATUS_META: Record<TaskStatus, StatusMeta> = {
  todo: {
    label: "انجام‌نشده",
    color: "#EAE3D8",
    textColor: "#62584D",
  },
  in_progress: {
    label: "در حال انجام",
    color: "#E8EDD9",
    textColor: "#4F6332",
  },
  done: {
    label: "انجام‌شده",
    color: "#DDE7C7",
    textColor: "#3a5e22",
  },
  archived: {
    label: "آرشیوشده",
    color: "#DDD6CD",
    textColor: "#675C52",
  },
};

export const TASK_CATEGORY_PALETTE = [
  "#8A5A44",
  "#7A8450",
  "#C49A5A",
  "#B76E79",
  "#6F8F5B",
  "#7A6A5A",
  "#5E3A2F",
  "#4A7A8A",
];

export const PRIORITY_OPTIONS = (
  Object.keys(TASK_PRIORITY_META) as TaskPriority[]
).map((k) => ({
  value: k,
  label: TASK_PRIORITY_META[k].label,
}));

export const STATUS_OPTIONS = (
  Object.keys(TASK_STATUS_META) as TaskStatus[]
).map((k) => ({
  value: k,
  label: TASK_STATUS_META[k].label,
}));
