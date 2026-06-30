"use client";

import { cn } from "@/lib/utils";

export const HABIT_COLORS = [
  { key: "#8A5A44", label: "قهوه‌ای گرم" },
  { key: "#C49A5A", label: "طلایی" },
  { key: "#6F8F5B", label: "سبز" },
  { key: "#7A8450", label: "زیتونی" },
  { key: "#B76E79", label: "گلبهی" },
  { key: "#5E7A99", label: "آبی" },
  { key: "#8A6A9A", label: "بنفش" },
  { key: "#5E3A2F", label: "قهوه‌ای تیره" },
  { key: "#B94A48", label: "قرمز" },
  { key: "#4A7A7A", label: "فیروزه‌ای" },
  { key: "#9A7A5A", label: "کرم" },
  { key: "#2B2520", label: "تیره" },
];

interface HabitColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function HabitColorPicker({ value, onChange }: HabitColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {HABIT_COLORS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          title={label}
          onClick={() => onChange(key)}
          className={cn(
            "size-8 rounded-xl border-2 transition-all duration-150",
            value === key ? "border-foreground scale-110 shadow-md" : "border-transparent hover:scale-105"
          )}
          style={{ backgroundColor: key }}
        />
      ))}
    </div>
  );
}
