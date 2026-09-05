"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { tomorrowSchedule } from "@/lib/planner-dates";
import { PRIORITY_OPTIONS, type TaskPriority } from "@/lib/task-constants";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export function TaskPlanningActions({
  id,
  priority,
  done,
  className,
}: {
  id: string;
  priority: TaskPriority;
  done: boolean;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function update(data: object) {
    setPending(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      router.refresh();
      toast.success("برنامه به‌روز شد.");
    } catch {
      toast.error("ذخیره نشد. دوباره تلاش کنید.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <PrioritySelect priority={priority} disabled={pending} onChange={(value) => update({ priority: value })} />
      <Tooltip label="انتقال به فردا"><Button size="icon" variant="ghost" disabled={pending || done} onClick={() => update(tomorrowSchedule())} aria-label="انتقال به فردا"><ArrowLeft className="size-5" /></Button></Tooltip>
      <Tooltip label="لغو وظیفه"><Button size="icon" variant="ghost" disabled={pending || done} onClick={() => update({ status: "archived" })} aria-label="لغو وظیفه"><X className="size-5 text-danger" /></Button></Tooltip>
    </div>
  );
}

function PrioritySelect({ priority, disabled, onChange }: { priority: TaskPriority; disabled: boolean; onChange: (value: TaskPriority) => void }) {
  const [open, setOpen] = useState(false);
  const current = PRIORITY_OPTIONS.find((option) => option.value === priority);
  return (
    <div className="relative">
      <button type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="inline-flex h-10 min-w-24 items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 text-xs font-black text-foreground shadow-sm transition hover:border-primary/45 hover:bg-primary-soft/10 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
        <span>{current?.label ?? "اولویت"}</span><ChevronDown className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div role="listbox" aria-label="اولویت وظیفه" className="absolute right-0 top-[calc(100%+0.4rem)] z-30 min-w-full overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-[0_12px_35px_rgba(94,58,47,0.16)]">
        {PRIORITY_OPTIONS.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === priority} onClick={() => { onChange(option.value); setOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-right text-xs font-bold transition hover:bg-primary-soft/25 ${option.value === priority ? "bg-primary-soft/45 text-primary-dark" : "text-foreground"}`}>{option.label}</button>)}
      </div>}
    </div>
  );
}
