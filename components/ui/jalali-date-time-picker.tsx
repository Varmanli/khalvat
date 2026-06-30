"use client";

import { useState, useRef, useEffect, useLayoutEffect, CSSProperties } from "react";
import { Calendar, ChevronRight, ChevronLeft, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  gregorianToJalali,
  jalaliToGregorian,
  daysInJalaliMonth,
  firstWeekdayOfJalaliMonth,
  jalaliMonthName,
  toPersianDigits,
  formatJalaliDate,
  formatJalaliDateTime,
  parseDateValue,
} from "@/lib/date";

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const PANEL_HEIGHT_ESTIMATE = 360;

interface JalaliDateTimePickerProps {
  label?: string;
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  minDate?: string;
  maxDate?: string;
  withTime?: boolean;
  clearable?: boolean;
  placement?: "auto" | "top" | "bottom";
  align?: "start" | "end";
  popoverClassName?: string;
}

function todayJalali(): [number, number, number] {
  const t = new Date();
  return gregorianToJalali(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

function initFromValue(value?: string | null) {
  const parsed = parseDateValue(value);
  if (!parsed) return null;
  const [jy, jm, jd] = gregorianToJalali(
    parsed.getFullYear(),
    parsed.getMonth() + 1,
    parsed.getDate()
  );
  return { jy, jm, jd, hour: parsed.getHours(), minute: parsed.getMinutes() };
}

export function JalaliDateTimePicker({
  label,
  value,
  onChange,
  placeholder = "انتخاب تاریخ...",
  error,
  disabled,
  className,
  withTime = false,
  clearable = false,
  placement = "auto",
  popoverClassName,
}: JalaliDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const [todayJY, todayJM, todayJD] = todayJalali();

  const [viewJY, setViewJY] = useState<number>(() => {
    const init = initFromValue(value);
    return init ? init.jy : todayJY;
  });
  const [viewJM, setViewJM] = useState<number>(() => {
    const init = initFromValue(value);
    return init ? init.jm : todayJM;
  });

  const [selJY, setSelJY] = useState<number | null>(() => initFromValue(value)?.jy ?? null);
  const [selJM, setSelJM] = useState<number | null>(() => initFromValue(value)?.jm ?? null);
  const [selJD, setSelJD] = useState<number | null>(() => initFromValue(value)?.jd ?? null);
  const [selHour, setSelHour] = useState<number>(() => initFromValue(value)?.hour ?? 9);
  const [selMinute, setSelMinute] = useState<number>(() => initFromValue(value)?.minute ?? 0);

  useEffect(() => {
    const init = initFromValue(value);
    if (init) {
      setSelJY(init.jy); setSelJM(init.jm); setSelJD(init.jd);
      setSelHour(init.hour); setSelMinute(init.minute);
      setViewJY(init.jy); setViewJM(init.jm);
    } else {
      setSelJY(null); setSelJM(null); setSelJD(null);
    }
  }, [value]);

  // Calculate fixed panel position when opening
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function calc() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const availBelow = vh - rect.bottom;
      const availAbove = rect.top;
      const panelHeight = withTime ? PANEL_HEIGHT_ESTIMATE : PANEL_HEIGHT_ESTIMATE - 60;

      let openAbove = false;
      if (placement === "top") openAbove = true;
      else if (placement === "bottom") openAbove = false;
      else openAbove = availBelow < panelHeight + 8 && availAbove > availBelow;

      const panelWidth = Math.min(288, vw - 32);
      // RTL: align right edge of panel to right edge of trigger
      const rightEdge = vw - rect.right;
      const safeRight = Math.max(8, Math.min(rightEdge, vw - panelWidth - 8));

      const style: CSSProperties = {
        position: "fixed",
        right: safeRight,
        width: panelWidth,
        zIndex: 50,
      };

      if (openAbove) {
        style.bottom = vh - rect.top + 8;
      } else {
        style.top = rect.bottom + 8;
      }

      setPanelStyle(style);
    }

    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("scroll", calc, true);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("scroll", calc, true);
    };
  }, [open, placement, withTime]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function prevMonth() {
    if (viewJM === 1) { setViewJY((y) => y - 1); setViewJM(12); }
    else setViewJM((m) => m - 1);
  }

  function nextMonth() {
    if (viewJM === 12) { setViewJY((y) => y + 1); setViewJM(1); }
    else setViewJM((m) => m + 1);
  }

  function emitDate(jy: number, jm: number, jd: number, hour: number, minute: number) {
    const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
    onChange(new Date(gy, gm - 1, gd, hour, minute, 0).toISOString());
  }

  function selectDay(jd: number) {
    setSelJY(viewJY); setSelJM(viewJM); setSelJD(jd);
    if (!withTime) { emitDate(viewJY, viewJM, jd, selHour, selMinute); setOpen(false); }
  }

  function goToday() {
    setViewJY(todayJY); setViewJM(todayJM);
    setSelJY(todayJY); setSelJM(todayJM); setSelJD(todayJD);
    if (!withTime) { emitDate(todayJY, todayJM, todayJD, selHour, selMinute); setOpen(false); }
  }

  function confirm() {
    if (selJY !== null && selJM !== null && selJD !== null) {
      emitDate(selJY, selJM, selJD, selHour, selMinute);
    }
    setOpen(false);
  }

  function clear() {
    setSelJY(null); setSelJM(null); setSelJD(null);
    onChange(null); setOpen(false);
  }

  const daysInMonth = daysInJalaliMonth(viewJY, viewJM);
  const firstWeekday = firstWeekdayOfJalaliMonth(viewJY, viewJM);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const displayValue = value
    ? withTime ? formatJalaliDateTime(value) : formatJalaliDate(value)
    : null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={cn(
            "w-full h-12 px-4 flex items-center justify-between gap-2 text-sm",
            "rounded-2xl border bg-card",
            "border-border",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
            "transition-colors duration-150 cursor-pointer",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-danger",
            open && "border-primary ring-2 ring-primary-soft"
          )}
        >
          <span className={displayValue ? "text-foreground" : "text-muted"}>
            {displayValue ?? placeholder}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {clearable && displayValue && (
              <span
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="text-muted hover:text-danger transition-colors cursor-pointer p-0.5"
              >
                <X size={13} />
              </span>
            )}
            <Calendar size={15} className="text-muted" />
          </div>
        </button>

        {/* Calendar panel — rendered with fixed positioning to avoid overlap */}
        {open && (
          <div
            style={panelStyle}
            className={cn(
              "rounded-3xl border border-border bg-card shadow-xl p-4 max-h-[90vh] overflow-auto",
              popoverClassName
            )}
          >
            {/* Month header */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={nextMonth}
                className="p-1.5 rounded-xl hover:bg-card-soft text-muted hover:text-foreground transition-colors">
                <ChevronRight size={16} />
              </button>
              <span className="text-sm font-semibold text-foreground">
                {jalaliMonthName(viewJM)} {toPersianDigits(viewJY)}
              </span>
              <button type="button" onClick={prevMonth}
                className="p-1.5 rounded-xl hover:bg-card-soft text-muted hover:text-foreground transition-colors">
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-xs text-muted py-1 font-medium">{w}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const isToday = day === todayJD && viewJM === todayJM && viewJY === todayJY;
                const isSelected = day === selJD && viewJM === selJM && viewJY === selJY;
                return (
                  <button key={`d-${i}`} type="button" onClick={() => selectDay(day)}
                    className={cn(
                      "w-full aspect-square flex items-center justify-center rounded-xl text-sm transition-colors duration-100",
                      isSelected && "bg-primary text-white font-semibold",
                      isToday && !isSelected && "bg-primary-soft text-primary-dark font-semibold",
                      !isSelected && !isToday && "text-foreground hover:bg-card-soft"
                    )}>
                    {toPersianDigits(day)}
                  </button>
                );
              })}
            </div>

            {/* Time picker */}
            {withTime && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-3">
                <Clock size={14} className="text-muted" />
                <div className="flex items-center gap-1 text-sm" dir="ltr">
                  <select value={selHour} onChange={(e) => setSelHour(Number(e.target.value))}
                    className="w-14 text-center rounded-lg border border-border bg-card text-sm py-1 focus:outline-none focus:border-primary cursor-pointer">
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                  <span className="text-muted px-0.5">:</span>
                  <select value={selMinute} onChange={(e) => setSelMinute(Number(e.target.value))}
                    className="w-14 text-center rounded-lg border border-border bg-card text-sm py-1 focus:outline-none focus:border-primary cursor-pointer">
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                      <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <button type="button" onClick={goToday}
                className="text-xs text-primary hover:text-primary-dark transition-colors font-medium">
                امروز
              </button>
              <div className="flex items-center gap-2">
                {clearable && (
                  <button type="button" onClick={clear}
                    className="text-xs text-muted hover:text-danger transition-colors">
                    پاک کردن
                  </button>
                )}
                {withTime && (
                  <button type="button" onClick={confirm} disabled={selJD === null}
                    className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-40">
                    تایید
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

