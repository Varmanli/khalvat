"use client";
import { useEffect, useRef, type ReactNode } from "react";
export function HourScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    const morning = container?.querySelector<HTMLElement>('[data-hour="7"]');
    if (container && morning)
      container.scrollTop = morning.offsetTop - container.offsetTop;
  }, []);
  return (
    <div
      ref={ref}
      tabIndex={0}
      aria-label="ساعت‌های روز؛ برای دیدن همه ساعت‌ها پیمایش کنید"
      className="relative max-h-[36rem] overflow-y-auto overscroll-contain pe-2 focus-visible:outline-2 focus-visible:outline-primary"
    >
      {children}
    </div>
  );
}
