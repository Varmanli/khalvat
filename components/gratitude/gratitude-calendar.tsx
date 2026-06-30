"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  getJalaliParts,
  getJalaliMonthGrid,
  firstWeekdayOfJalaliMonth,
  formatJalaliMonthTitle,
  toGregorianIso,
  toPersianDigits,
} from "@/lib/date";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface GratitudeCalendarProps {
  filledDates: string[]; // Gregorian ISO YYYY-MM-DD
  selectedDate: string; // Gregorian ISO YYYY-MM-DD
}

export function GratitudeCalendar({
  filledDates,
  selectedDate,
}: GratitudeCalendarProps) {
  // Today as Gregorian ISO — no Jalali math involved, immune to any conversion bugs
  const todayIso = toGregorianIso(new Date());

  // Derive initial Jalali view month from the selected date
  const { jy: initJy, jm: initJm } = getJalaliParts(selectedDate);

  const [viewYear, setViewYear] = useState(initJy);
  const [viewMonth, setViewMonth] = useState(initJm);

  const filledSet = new Set(filledDates);
  const cells = getJalaliMonthGrid(viewYear, viewMonth);
  const firstDay = firstWeekdayOfJalaliMonth(viewYear, viewMonth);

  function prevMonth() {
    const total = viewYear * 12 + (viewMonth - 1) - 1;
    setViewYear(Math.floor(total / 12));
    setViewMonth((total % 12) + 1);
  }

  function nextMonth() {
    const total = viewYear * 12 + (viewMonth - 1) + 1;
    setViewYear(Math.floor(total / 12));
    setViewMonth((total % 12) + 1);
  }

  return (
    <div className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={nextMonth}
          className="flex size-9 items-center justify-center rounded-xl bg-background text-muted transition-colors hover:bg-card-soft hover:text-foreground"
          aria-label="ماه بعد"
        >
          <ChevronRight className="size-4" />
        </button>

        <p className="text-sm font-black text-foreground">
          {formatJalaliMonthTitle(viewYear, viewMonth)}
        </p>

        <button
          type="button"
          onClick={prevMonth}
          className="flex size-9 items-center justify-center rounded-xl bg-background text-muted transition-colors hover:bg-card-soft hover:text-foreground"
          aria-label="ماه قبل"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-bold text-muted"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty leading cells to align day-1 under correct weekday */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {cells.map(({ jalaliDay, gregorianIso }) => {
          const isSelected = gregorianIso === selectedDate;
          const isTodayCell = gregorianIso === todayIso;
          const isFilled = filledSet.has(gregorianIso);
          const isFuture = gregorianIso > todayIso;

          if (isFuture) {
            return (
              <div
                key={jalaliDay}
                aria-disabled="true"
                className="relative flex aspect-square items-center justify-center rounded-xl text-xs font-semibold opacity-30 cursor-not-allowed select-none text-muted"
              >
                {toPersianDigits(jalaliDay)}
              </div>
            );
          }

          return (
            <Link
              key={jalaliDay}
              href={`/gratitude?date=${gregorianIso}`}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-xl text-xs font-semibold transition-all duration-150",
                isSelected
                  ? "bg-primary text-white shadow-[0_8px_20px_rgba(138,90,68,0.28)]"
                  : isTodayCell
                    ? "ring-2 ring-primary bg-primary-soft/30 text-primary font-black"
                    : isFilled
                      ? "bg-gold/18 text-foreground hover:bg-gold/30"
                      : "text-muted/60 hover:bg-card-soft hover:text-foreground",
              )}
            >
              {toPersianDigits(jalaliDay)}
              {isFilled && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-gold" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-gold/60" />
          روزهای ثبت‌شده
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full ring-2 ring-primary" />
          امروز
        </span>
      </div>
    </div>
  );
}
