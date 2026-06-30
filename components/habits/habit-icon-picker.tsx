"use client";

import { cn } from "@/lib/utils";
import { HABIT_ICONS, getHabitIcon } from "./habit-icons";

// Re-export so existing imports of getHabitIcon from this file keep working
export { getHabitIcon, HABIT_ICONS };

interface HabitIconPickerProps {
  value: string;
  onChange: (key: string) => void;
}

export function HabitIconPicker({ value, onChange }: HabitIconPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {HABIT_ICONS.map(({ key, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "flex size-10 items-center justify-center rounded-2xl border transition-all duration-150",
            value === key
              ? "border-primary bg-primary text-white shadow-[0_8px_20px_rgba(138,90,68,0.3)]"
              : "border-border bg-card text-muted hover:border-primary-soft hover:text-primary"
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}
