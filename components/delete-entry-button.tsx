"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("مطمئنی که می‌خوای این نوشته رو پاک کنی؟")) return;

    const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
    const json = await res.json();

    if (json.ok) {
      toast.success("نوشته پاک شد.");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(json.error?.message ?? "خطایی رخ داد.");
    }
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} className="gap-1.5">
      <Trash2 size={14} />
      پاک کردن
    </Button>
  );
}
