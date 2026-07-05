export const DAILY_CHECK_IN_OPTIONS = [
  { mood: "great", emoji: "😄", label: "عالی" },
  { mood: "good", emoji: "🙂", label: "خوب" },
  { mood: "normal", emoji: "😐", label: "معمولی" },
  { mood: "hard", emoji: "😔", label: "سخت" },
  { mood: "bad", emoji: "😡", label: "بد" },
  { mood: "tired", emoji: "😴", label: "خسته" },
] as const;

export type DailyCheckInMood = (typeof DAILY_CHECK_IN_OPTIONS)[number]["mood"];

const moodMetaMap = Object.fromEntries(
  DAILY_CHECK_IN_OPTIONS.map((option) => [option.mood, option])
) as Record<DailyCheckInMood, (typeof DAILY_CHECK_IN_OPTIONS)[number]>;

export function getMoodMeta(mood: DailyCheckInMood) {
  return moodMetaMap[mood];
}
