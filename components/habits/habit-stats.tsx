import { formatPersianNumber } from "@/lib/persian-numbers";

interface HabitStatsProps {
  stats: {
    totalDone: number;
    currentStreak: number;
    bestStreak: number;
    doneThisMonth: number;
    scheduledThisMonth: number;
    completionRateThisMonth: number;
  };
}

export function HabitStats({ stats }: HabitStatsProps) {
  const items = [
    { label: "مجموع انجام‌شده", value: formatPersianNumber(stats.totalDone), sub: "بار" },
    {
      label: "زنجیره فعلی",
      value: formatPersianNumber(stats.currentStreak),
      sub: "روز",
      highlight: stats.currentStreak >= 7,
    },
    { label: "بهترین زنجیره", value: formatPersianNumber(stats.bestStreak), sub: "روز" },
    {
      label: "این ماه",
      value: formatPersianNumber(stats.doneThisMonth),
      sub: `از ${formatPersianNumber(stats.scheduledThisMonth)} روز`,
    },
    {
      label: "نرخ تکمیل ماه",
      value: `${formatPersianNumber(stats.completionRateThisMonth)}٪`,
      sub: "",
      highlight: stats.completionRateThisMonth >= 80,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[1.5rem] border p-4 text-center ${
            item.highlight
              ? "border-success/25 bg-success/8"
              : "border-border bg-card"
          }`}
        >
          <p className="text-2xl font-black text-foreground">{item.value}</p>
          <p className="mt-0.5 text-[11px] text-muted">{item.sub}</p>
          <p className="mt-1 text-xs font-bold text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
