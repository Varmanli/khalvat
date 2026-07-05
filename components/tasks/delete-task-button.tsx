"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";

interface DeleteTaskButtonProps {
  taskId: string;
  redirectTo?: string;
  compact?: boolean;
}

export function DeleteTaskButton({
  taskId,
  redirectTo,
  compact = false,
}: DeleteTaskButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
        return;
      }

      toast.success("وظیفه حذف شد.");
      setOpen(false);

      if (redirectTo) {
        router.push(redirectTo);
      }

      router.refresh();
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size={compact ? "sm" : "md"}
        onClick={() => setOpen(true)}
        className={compact ? "gap-1.5 rounded-2xl" : "gap-2 rounded-2xl"}
      >
        <Trash2 className={compact ? "size-4" : "size-4"} />
        حذف
      </Button>

      <ConfirmationDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="حذف شود؟"
        description="این وظیفه حذف می‌شود."
        confirmLabel="بله، حذف کن"
        pendingLabel="در حال حذف..."
      />
    </>
  );
}
