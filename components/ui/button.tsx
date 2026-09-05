import { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
}

const variantStyles = {
  primary:
    "bg-primary text-white hover:bg-primary-dark active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",

  secondary:
    "border border-border bg-card-soft text-foreground hover:border-primary-soft hover:bg-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",

  ghost:
    "bg-transparent text-muted hover:bg-card-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",

  danger:
    "bg-danger text-white hover:opacity-90 active:opacity-80 focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2",
};

const sizeStyles = {
  sm: "h-8 rounded-lg px-3 text-sm",
  md: "h-10 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-2xl px-6 text-base",
  icon: "size-10 rounded-xl p-0",
};

const iconSizeStyles = {
  sm: "[&>svg]:size-3.5",
  md: "[&>svg]:size-4",
  lg: "[&>svg]:size-5",
  icon: "[&>svg]:size-4",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  leftIcon,
  rightIcon,
  iconOnly = false,
  ...props
}: ButtonProps) {
  const resolvedSize = iconOnly ? "icon" : size;

  return (
    <button
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium outline-none transition-all duration-150",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[resolvedSize],
        iconSizeStyles[resolvedSize],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && (
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center justify-center"
        >
          {leftIcon}
        </span>
      )}

      {!iconOnly && children}

      {rightIcon && (
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center justify-center"
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
}
