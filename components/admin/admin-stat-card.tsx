import { cn } from "@/lib/utils";
import { formatPersianNumberWithSeparator } from "@/lib/persian-numbers";
import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  description?: string;
  tone?: "primary" | "gold" | "rose" | "olive" | "default";
}

const TONE_STYLES = {
  primary: "bg-primary text-white",
  gold: "bg-gold text-white",
  rose: "bg-rose text-white",
  olive: "bg-olive text-white",
  default: "bg-primary-soft/40 text-primary",
} as const;

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "default",
}: AdminStatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_4px_18px_rgba(43,37,32,0.05)]">
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-2xl",
          TONE_STYLES[tone]
        )}
      >
        <Icon size={18} />
      </span>
      <div>
        <p className="text-2xl font-black text-foreground">
          {formatPersianNumberWithSeparator(value)}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11px] text-muted/70">{description}</p>
        )}
      </div>
    </div>
  );
}
