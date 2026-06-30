import {
  Leaf,
  Sparkles,
  Moon,
  Sun,
  Star,
  Heart,
  Feather,
  BookOpen,
  Coffee,
  Smile,
  Bird,
  Cloud,
  PenLine,
  Flame,
  Gem,
  Layers,
  Waves,
  Music,
  Flower2,
  NotebookText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AvatarIconOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const USER_AVATAR_ICONS: AvatarIconOption[] = [
  { key: "leaf", label: "برگ", icon: Leaf },
  { key: "sparkles", label: "جرقه", icon: Sparkles },
  { key: "moon", label: "ماه", icon: Moon },
  { key: "sun", label: "خورشید", icon: Sun },
  { key: "star", label: "ستاره", icon: Star },
  { key: "heart", label: "قلب", icon: Heart },
  { key: "feather", label: "پر", icon: Feather },
  { key: "book-open", label: "کتاب", icon: BookOpen },
  { key: "coffee", label: "قهوه", icon: Coffee },
  { key: "flower", label: "گل", icon: Flower2 },
  { key: "smile", label: "لبخند", icon: Smile },
  { key: "bird", label: "پرنده", icon: Bird },
  { key: "cloud", label: "ابر", icon: Cloud },
  { key: "pen-line", label: "قلم", icon: PenLine },
  { key: "notebook", label: "دفترچه", icon: NotebookText },
  { key: "flame", label: "شعله", icon: Flame },
  { key: "gem", label: "جواهر", icon: Gem },
  { key: "layers", label: "لایه‌ها", icon: Layers },
  { key: "waves", label: "موج", icon: Waves },
  { key: "music", label: "موسیقی", icon: Music },
];

export const USER_AVATAR_COLORS = [
  "#8A5A44",
  "#C49A5A",
  "#7A8F5A",
  "#B7776B",
  "#6F7F9A",
  "#9B6B9E",
  "#5F8C8B",
  "#A8704D",
];

export function getUserAvatarIcon(key?: string | null): LucideIcon {
  const match = USER_AVATAR_ICONS.find((o) => o.key === key);
  return match?.icon ?? Leaf;
}

export function getUserAvatarColor(color?: string | null): string {
  return color ?? USER_AVATAR_COLORS[0];
}
