"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export function ArchiveHabitButton({ habitId }: { habitId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function archive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
        return;
      }

      toast.success("عادت از لیست فعال حذف شد.");
      setOpen(false);
      router.push("/habits");
      router.refresh();
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="flex items-center gap-2 rounded-2xl border border-danger/30 bg-danger/8 px-4 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger/14 disabled:opacity-60"
      >
        <Trash2 className="size-3.5" />
        حذف عادت
      </button>

      <ConfirmationDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={archive}
        confirming={loading}
        title="حذف شود؟"
        description="این عادت از لیست فعال تو حذف می‌شود. این کار قابل بازگشت نیست."
        confirmLabel="بله، حذف کن"
        pendingLabel="در حال حذف..."
      />
    </>
  );
}
