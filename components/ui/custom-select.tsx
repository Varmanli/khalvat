"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface CustomSelectProps {
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function CustomSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "انتخاب کنید...",
  error,
  disabled,
  className,
  triggerClassName,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function toggle() {
    if (disabled) return;
    if (!open) {
      setHighlighted(options.findIndex((o) => o.value === value));
    }
    setOpen((o) => !o);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlighted(options.findIndex((o) => o.value === value));
      } else if (highlighted >= 0 && options[highlighted]) {
        onValueChange(options[highlighted].value);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlighted(0);
      } else {
        setHighlighted((h) => Math.min(h + 1, options.length - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className={cn("relative", open ? "z-[100]" : "z-auto")}>
        <button
          type="button"
          disabled={disabled}
          onClick={toggle}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "w-full h-12 px-4 flex items-center justify-between gap-2 text-sm",
            "rounded-2xl border bg-card text-foreground",
            "border-border",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
            "transition-colors duration-150 cursor-pointer select-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-danger",
            open && "border-primary ring-2 ring-primary-soft",
            triggerClassName
          )}
        >
          <span
            className={
              selectedOption ? "text-foreground" : "text-muted"
            }
          >
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-muted transition-transform duration-150 shrink-0",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute top-full mt-1 right-0 left-0 z-[110] max-h-60 overflow-auto rounded-2xl border border-border bg-card shadow-lg py-1"
          >
            {options.map((option, i) => {
              const isSelected = option.value === value;
              const isHighlighted = i === highlighted;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors duration-100",
                    isSelected && "bg-primary-soft text-primary-dark",
                    isHighlighted &&
                      !isSelected &&
                      "bg-card-soft text-foreground",
                    !isSelected && !isHighlighted && "text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && <span>{option.icon}</span>}
                    <div>
                      <div>{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-primary shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

