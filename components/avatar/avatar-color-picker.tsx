"use client";

import { cn } from "@/lib/utils";
import { USER_AVATAR_COLORS } from "@/lib/avatar-options";
import { Check } from "lucide-react";

interface AvatarColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function AvatarColorPicker({ value, onChange }: AvatarColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {USER_AVATAR_COLORS.map((color) => {
        const selected = value === color;
        return (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            className={cn(
              "relative size-9 rounded-full transition-all duration-200",
              selected
                ? "ring-4 ring-primary/40 scale-110 shadow-lg"
                : "hover:scale-105 hover:shadow-md"
            )}
          >
            {selected && (
              <Check
                size={14}
                strokeWidth={3}
                className="absolute inset-0 m-auto text-white"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
