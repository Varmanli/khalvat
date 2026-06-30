import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

