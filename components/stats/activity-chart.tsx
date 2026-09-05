import { formatJalaliDay, formatJalaliMonthTitle, getJalaliParts } from "@/lib/date";
import { formatPersianNumber } from "@/lib/persian-numbers";

export function ActivityChart({ data, title, description }: { data: Array<{ date: string; value: number }>; title: string; description: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => `${data.length === 1 ? 50 : 4 + index / (data.length - 1) * 92},${92 - item.value / max * 76}`).join(" ");
  const labels = data.length > 10 ? [data[0], data[Math.floor(data.length / 2)], data.at(-1)!] : data.filter((_, i) => i % Math.max(1, Math.ceil(data.length / 4)) === 0);
  const label = (date: string) => data.length > 40 ? formatJalaliMonthTitle(getJalaliParts(date).jy, getJalaliParts(date).jm) : formatJalaliDay(date).replace(/\s۱۴\d{2}/, "");
  if (!data.some((item) => item.value)) return <EmptyChart text="در این بازه هنوز فعالیتی ثبت نشده است." />;
  return <section className="rounded-[1.8rem] border border-border bg-background/55 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black text-foreground">{title}</h3><p className="mt-1 text-xs leading-5 text-muted">{description}</p></div><span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-bold text-muted">بیشینه {formatPersianNumber(max)}</span></div>
    <div className="mt-5" role="img" aria-label={`${title}: ${data.map((item) => `${label(item.date)}، ${formatPersianNumber(item.value)}`).join("؛ ")}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full overflow-visible" aria-hidden="true"><path d="M4 92H96" stroke="currentColor" className="text-border" strokeWidth="0.7" /><path d={`M${points}`} fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{data.map((item, index) => item.value > 0 && <circle key={item.date} cx={data.length === 1 ? 50 : 4 + index / (data.length - 1) * 92} cy={92 - item.value / max * 76} r="1.8" className="fill-primary" />)}</svg>
      <div className="mt-1 flex justify-between gap-2 text-[10px] font-bold text-muted">{labels.map((item) => <span key={item.date}>{label(item.date)}</span>)}</div>
    </div>
  </section>;
}
export function EmptyChart({ text }: { text: string }) { return <div className="rounded-[1.8rem] border border-dashed border-border bg-background/55 p-8 text-center text-sm leading-7 text-muted">{text}</div>; }
