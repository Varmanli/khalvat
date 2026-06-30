import { cn } from "@/lib/utils";
import { getUserAvatarColor, getUserAvatarIcon } from "@/lib/avatar-options";

export interface UserAvatarProps {
  icon?: string | null;
  color?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  subtle?: boolean;
}

const sizeMap = {
  sm: {
    container: "size-8 rounded-xl",
    icon: 14,
    glow: "size-5",
  },
  md: {
    container: "size-11 rounded-2xl",
    icon: 18,
    glow: "size-7",
  },
  lg: {
    container: "size-16 rounded-3xl",
    icon: 26,
    glow: "size-10",
  },
  xl: {
    container: "size-20 rounded-[2rem]",
    icon: 34,
    glow: "size-12",
  },
};

export function UserAvatar({
  icon,
  color,
  name,
  size = "md",
  className,
  subtle = false,
}: UserAvatarProps) {
  const Icon = getUserAvatarIcon(icon);
  const bg = getUserAvatarColor(color);
  const sz = sizeMap[size];

  return (
    <span
      title={name ?? "آواتار کاربر"}
      aria-label={name ? `آواتار ${name}` : "آواتار کاربر"}
      style={{ backgroundColor: bg }}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden text-white",
        "shadow-[0_14px_36px_rgba(94,58,47,0.18)] ring-1 ring-white/35",
        "transition-transform duration-200",
        !subtle && "hover:scale-105",
        sz.container,
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/24 via-white/6 to-black/10" />

      <span
        className={cn(
          "pointer-events-none absolute -left-1 -top-1 rounded-full bg-white/18 blur-xl",
          sz.glow,
        )}
      />

      <Icon
        size={sz.icon}
        strokeWidth={2.25}
        className="relative drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
      />
    </span>
  );
}
