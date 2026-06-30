"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      await fetch(`/api/tasks/${taskId}/toggle`, { method: "PATCH" });
      router.refresh();
    } catch {
      setIsDone((d) => !d);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={isDone ? "علامت نشده" : "علامت انجام‌شده"}
      className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150",
        isDone
          ? "bg-success border-success text-white"
          : "border-border hover:border-success bg-transparent",
        loading && "opacity-50"
      )}
    >
      {isDone && <Check size={12} />}
    </button>
  );
}

