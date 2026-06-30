"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserRoleSelectProps {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}

export function UserRoleSelect({
  userId,
  currentRole,
  isSelf,
}: UserRoleSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isSelf) {
    return (
      <span
        title="نمی‌توانی نقش خودت را تغییر بدهی"
        className="inline-flex items-center rounded-full border border-border bg-card-soft px-2.5 py-0.5 text-[11px] font-semibold text-muted"
      >
        {currentRole === "admin" ? "مدیر" : "کاربر"}
      </span>
    );
  }

  async function changeRole(role: "user" | "admin") {
    if (role === currentRole) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");
      } else {
        toast.success("نقش کاربر به‌روزرسانی شد.");
        router.refresh();
      }
    } catch {
      toast.error("خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1">
      {(["user", "admin"] as const).map((role) => (
        <button
          key={role}
          type="button"
          disabled={loading || role === currentRole}
          onClick={() => changeRole(role)}
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-black transition-all",
            role === currentRole
              ? role === "admin"
                ? "bg-primary text-white"
                : "bg-card-soft text-muted"
              : "border border-border text-muted hover:border-primary/50 hover:text-primary disabled:opacity-40"
          )}
        >
          {role === "admin" ? "مدیر" : "کاربر"}
        </button>
      ))}
    </div>
  );
}
