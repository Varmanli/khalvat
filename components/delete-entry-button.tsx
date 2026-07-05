"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Trash2 } from "lucide-react";

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
        return;
      }

      toast.success("نوشته حذف شد.");
      setOpen(false);
      router.push("/entries");
      router.refresh();
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Trash2 size={14} />
        حذف
      </Button>

      <ConfirmationDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="حذف شود؟"
        description="این نوشته حذف می‌شود و دیگر در لیست نوشته‌ها نمایش داده نخواهد شد."
        confirmLabel="بله، حذف کن"
        pendingLabel="در حال حذف..."
      />
    </>
  );
}
