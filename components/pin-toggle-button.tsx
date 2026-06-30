"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pin } from "lucide-react";

interface PinToggleButtonProps {
  entryId: string;
  isPinned: boolean;
}

export function PinToggleButton({ entryId, isPinned }: PinToggleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !isPinned }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(isPinned ? "از پین خارج شد." : "پین شد.");
        router.refresh();
      } else {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={isPinned ? "خارج کردن از پین" : "پین کردن"}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 ${
        isPinned
          ? "bg-gold text-white"
          : "bg-card-soft text-muted hover:bg-border hover:text-foreground"
      } disabled:opacity-50`}
    >
      <Pin size={12} />
    </button>
  );
}

