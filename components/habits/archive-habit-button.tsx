"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { toast } from "sonner";

export function ArchiveHabitButton({ habitId }: { habitId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function archive() {
    if (!confirm("می‌خوای این عادت رو آرشیو کنی؟")) return;
    setLoading(true);
    const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    const json = await res.json();
    setLoading(false);
    if (!json.ok) {
      toast.error(json.error?.message ?? "خطایی رخ داد.");
      return;
    }
    toast.success("عادت آرشیو شد.");
    router.push("/habits");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={archive}
      disabled={loading}
      className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted hover:border-danger/40 hover:text-danger disabled:opacity-60"
    >
      <Archive className="size-3.5" />
      آرشیو
    </button>
  );
}
