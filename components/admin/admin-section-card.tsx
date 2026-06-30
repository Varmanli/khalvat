import type { ReactNode } from "react";
import Link from "next/link";

interface AdminSectionCardProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
}

export function AdminSectionCard({
  title,
  subtitle,
  actionLabel,
  actionHref,
  children,
}: AdminSectionCardProps) {
  return (
    <div className="rounded-[2rem] border border-border bg-card shadow-[0_8px_40px_rgba(43,37,32,0.06)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-black text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
        </div>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="shrink-0 text-xs font-bold text-primary hover:text-primary-dark"
          >
            {actionLabel} ←
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
