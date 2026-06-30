import type { LucideIcon } from "lucide-react";
import {
  StickyNote,
  Lightbulb,
  Feather,
  Clapperboard,
  BookOpen,
  Bell,
  Sparkles,
} from "lucide-react";

export type EntryType =
  | "note"
  | "idea"
  | "poem"
  | "watch"
  | "read"
  | "reminder"
  | "spark";

export type EntryMood =
  | "calm"
  | "sad"
  | "excited"
  | "nostalgic"
  | "dark"
  | "hopeful"
  | "romantic"
  | "tired"
  | "neutral";

export type EntryStatus = "raw" | "active" | "done" | "archived" | "dropped";

export interface EntryTypeMetadata {
  label: string;
  icon: LucideIcon;
}

export const ENTRY_TYPE_META: Record<EntryType, EntryTypeMetadata> = {
  note: { label: "یادداشت", icon: StickyNote },
  idea: { label: "ایده", icon: Lightbulb },
  poem: { label: "شعر", icon: Feather },
  watch: { label: "دیدنی", icon: Clapperboard },
  read: { label: "خواندنی", icon: BookOpen },
  reminder: { label: "یادآور", icon: Bell },
  spark: { label: "جرقه", icon: Sparkles },
};

export interface MoodMetadata {
  label: string;
  className: string;
}

export const MOOD_META: Record<EntryMood, MoodMetadata> = {
  calm: { label: "آرام", className: "bg-[#E8E0D0] text-[#5C5346]" },
  sad: { label: "غمگین", className: "bg-[#D8DEE8] text-[#46515F]" },
  excited: { label: "پرانرژی", className: "bg-[#F3D6A4] text-[#7A4E16]" },
  nostalgic: { label: "نوستالژیک", className: "bg-[#E7D2C2] text-[#6A4635]" },
  dark: { label: "تاریک", className: "bg-[#3A302B] text-[#F6EFE5]" },
  hopeful: { label: "امیدوار", className: "bg-[#DDE7C7] text-[#4F6332]" },
  romantic: { label: "عاشقانه", className: "bg-[#F0D1D6] text-[#79424D]" },
  tired: { label: "خسته", className: "bg-[#DDD6CD] text-[#675C52]" },
  neutral: { label: "معمولی", className: "bg-[#EAE3D8] text-[#62584D]" },
};

export const STATUS_LABELS: Record<EntryStatus, string> = {
  raw: "خام",
  active: "فعال",
  done: "انجام‌شده",
  archived: "آرشیوشده",
  dropped: "رهاشده",
};
