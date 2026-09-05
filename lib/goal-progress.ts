export type ProgressSource = { method: "manual" | "milestones" | "tasks" | "habits" | "numeric" | "time"; manual?: number; completed?: number; total?: number; current?: number | null; target?: number | null };
export function calculateGoalProgress(source: ProgressSource): number {
  if (source.method === "manual") return clamp(source.manual ?? 0);
  if (source.method === "numeric" || source.method === "time") return source.target ? clamp(((source.current ?? 0) / source.target) * 100) : 0;
  return source.total ? clamp(((source.completed ?? 0) / source.total) * 100) : 0;
}
export function expectedProgress(startDate?: string | null, targetDate?: string | null, today = new Date()): number | null {
  if (!startDate || !targetDate) return null;
  const start = new Date(`${startDate}T00:00:00`).getTime(), target = new Date(`${targetDate}T23:59:59`).getTime();
  if (target <= start) return null;
  return clamp(((today.getTime() - start) / (target - start)) * 100);
}
export function goalHealth(progress: number, expected: number | null, completed = false) {
  if (completed || progress >= 100) return { key: "completed", label: "تکمیل شده" } as const;
  if (expected === null) return { key: "steady", label: "با ریتم خودت پیش برو" } as const;
  if (progress >= expected - 8) return { key: "on_track", label: "تقریباً با برنامه پیش می‌روی" } as const;
  if (progress >= expected - 20) return { key: "attention", label: "کمی از ریتم برنامه عقب هستی" } as const;
  return { key: "behind", label: "شاید وقت بازبینی برنامه رسیده باشد" } as const;
}
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value * 10) / 10));
