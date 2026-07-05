"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface DeleteCheckInButtonProps {
  checkInId: string;
  className?: string;
  label?: string;
}

export function DeleteCheckInButton({
  checkInId,
  className,
  label = "حذف",
}: DeleteCheckInButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/check-ins/${checkInId}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
        return;
      }

      toast.success("ثبت حال روز حذف شد.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-2xl border border-danger/30 bg-danger/8 px-3 py-2 text-xs font-black text-danger transition-colors hover:bg-danger/14"
        }
      >
        <Trash2 className="size-3.5" />
        {label}
      </button>

      <ConfirmationDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="حذف شود؟"
        description="این ثبت حال روز حذف می‌شود و دیگر در تاریخچه نمایش داده نخواهد شد."
        confirmLabel="بله، حذف کن"
        pendingLabel="در حال حذف..."
      />
    </>
  );
}
