"use client";
import { useRouter } from "next/navigation";
import { CalendarItem } from "./calendar-item";
import type { CalendarItem as Item } from "@/lib/planner";
import { toPersianDigits } from "@/lib/date";

export function TimeBlocks({ items, date }: { items: Item[]; date: string }) {
  const router = useRouter();
  const timed = items.filter((item) => item.time);
  return (
    <div>
      <p className="mb-4 rounded-xl border border-dashed border-primary/30 bg-primary-soft/15 px-3 py-2 text-xs font-bold text-primary-dark">
        برای افزودن وظیفه، روی ساعت موردنظر کلیک کنید.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[0, 12].map((columnStart) => <div key={columnStart} className="overflow-hidden rounded-2xl border border-border/70 bg-background/35 px-3">
        {Array.from({ length: 12 }, (_, index) => {
          const hour = columnStart + index;
          const start = `${String(hour).padStart(2, "0")}:00`;
          const blocks = timed.filter((item) => Number(item.time!.slice(0, 2)) === hour || (item.endTime && item.time! < start && item.endTime > start));
          return (
            <div key={hour} data-hour={hour} role="button" tabIndex={0} onClick={(event) => { if ((event.target as HTMLElement).closest("a,button")) return; router.push(`/tasks/new?date=${date}&time=${start}`); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") router.push(`/tasks/new?date=${date}&time=${start}`); }} className="group grid min-h-14 cursor-pointer grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 border-t border-border/50 px-2 py-1.5 transition first:border-t-0 hover:rounded-xl hover:bg-primary-soft/20 focus-visible:relative focus-visible:outline-2 focus-visible:outline-primary">
              <span className="flex items-center rounded-xl px-3 text-xs font-bold text-muted transition group-hover:text-primary">
                {toPersianDigits(start)}
              </span>
              <div className="space-y-2">{blocks.map((item) => <CalendarItem key={item.id} item={item} />)}</div>
            </div>
          );
        })}
        </div>)}
      </div>
    </div>
  );
}
