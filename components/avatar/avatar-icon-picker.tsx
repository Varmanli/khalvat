"use client";

import { cn } from "@/lib/utils";
import { USER_AVATAR_ICONS } from "@/lib/avatar-options";

interface AvatarIconPickerProps {
  value: string;
  color: string;
  onChange: (key: string) => void;
}

export function AvatarIconPicker({ value, color, onChange }: AvatarIconPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {USER_AVATAR_ICONS.map(({ key, label, icon: Icon }) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            title={label}
            onClick={() => onChange(key)}
            className={cn(
              "group relative flex size-11 items-center justify-center rounded-2xl border-2 transition-all duration-200",
              selected
                ? "border-primary shadow-[0_8px_24px_rgba(138,90,68,0.28)] scale-105"
                : "border-border bg-card hover:border-primary/50 hover:bg-card-soft"
            )}
            style={selected ? { backgroundColor: color, borderColor: color } : {}}
          >
            <Icon
              size={18}
              strokeWidth={2}
              className={selected ? "text-white" : "text-muted group-hover:text-primary"}
            />
          </button>
        );
      })}
    </div>
  );
}
