import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Icon shown on the start side (right in RTL). */
  icon?: ReactNode;
  /** Slot rendered at the end side (left in RTL) — e.g. show/hide password button. */
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, icon, suffix, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full py-2.5 rounded-xl border bg-card text-foreground",
              "border-border placeholder:text-muted",
              "focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              "transition-colors duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon ? "ps-10 pe-4" : "px-4",
              !!suffix && "pe-10",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute end-3 top-1/2 -translate-y-1/2">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

