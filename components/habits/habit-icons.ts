import {
  BookOpen, Dumbbell, Droplets, Heart, Pen, Moon, Sun, Footprints,
  Brain, Leaf, Star, Music, Coffee, Apple, Bike, Flame, Wind, Smile,
  Zap, Flower2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface HabitIconDef {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const HABIT_ICONS: HabitIconDef[] = [
  { key: "book-open", label: "کتاب", Icon: BookOpen },
  { key: "dumbbell", label: "ورزش", Icon: Dumbbell },
  { key: "droplets", label: "آب", Icon: Droplets },
  { key: "heart", label: "قلب", Icon: Heart },
  { key: "pen", label: "نوشتن", Icon: Pen },
  { key: "moon", label: "شب", Icon: Moon },
  { key: "sun", label: "صبح", Icon: Sun },
  { key: "footprints", label: "پیاده‌روی", Icon: Footprints },
  { key: "brain", label: "ذهن", Icon: Brain },
  { key: "leaf", label: "طبیعت", Icon: Leaf },
  { key: "star", label: "ستاره", Icon: Star },
  { key: "music", label: "موسیقی", Icon: Music },
  { key: "coffee", label: "قهوه", Icon: Coffee },
  { key: "apple", label: "تغذیه", Icon: Apple },
  { key: "bike", label: "دوچرخه", Icon: Bike },
  { key: "flame", label: "آتش", Icon: Flame },
  { key: "wind", label: "تنفس", Icon: Wind },
  { key: "smile", label: "لبخند", Icon: Smile },
  { key: "zap", label: "انرژی", Icon: Zap },
  { key: "flower2", label: "گل", Icon: Flower2 },
];

export function getHabitIcon(key: string): LucideIcon {
  return HABIT_ICONS.find((i) => i.key === key)?.Icon ?? Star;
}
