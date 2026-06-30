import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({
  title,
  description,
  children,
  className,
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-border bg-card p-6 shadow-[0_8px_32px_rgba(43,37,32,0.06)] sm:p-8",
        className
      )}
    >
      <div className="mb-6 border-b border-border pb-5">
        <h2 className="text-base font-black text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
