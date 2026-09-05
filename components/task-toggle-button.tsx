"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";

interface TaskToggleButtonProps {
  taskId: string;
  isDone: boolean;
}

export function TaskToggleButton({ taskId, isDone: initialDone }: TaskToggleButtonProps) {
  const router = useRouter();
  const [isDone, setIsDone] = useState(initialDone);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    setIsDone((d) => !d);
    try {
      const response = await fetch(`/api/tasks/${taskId}/toggle`, { method: "PATCH" });
      if (!response.ok) throw new Error("Toggle failed");
      router.refresh();
    } catch {
      setIsDone((d) => !d);
      toast.error("ذخیره نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Tooltip label={isDone ? "بازگرداندن به انجام‌نشده" : "علامت‌گذاری به‌عنوان انجام‌شده"}>
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={isDone}
      aria-label={isDone ? "علامت نشده" : "علامت انجام‌شده"}
      title={isDone ? "علامت نشده" : "علامت انجام‌شده"}
      className={cn(
        "size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        isDone
          ? "bg-success border-success text-white shadow-[0_0_0_4px_rgba(91,133,61,0.16)]"
          : "border-primary/45 bg-card hover:border-success hover:bg-success/10",
        loading && "opacity-50"
      )}
    >
      <Check size={18} strokeWidth={3} className={isDone ? "opacity-100" : "text-muted/45"} />
    </button>
    </Tooltip>
  );
}

