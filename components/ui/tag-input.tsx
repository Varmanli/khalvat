"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { Hash, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/date";

interface TagInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

function parseTagsString(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(/[,،]/)
    .map((t) => t.trim().replace(/^#+/, ""))
    .filter((t) => t.length > 0);
}

function serializeTags(tags: string[]): string {
  return tags.join(", ");
}

export function TagInput({
  label,
  value,
  onChange,
  placeholder = "یک تگ بنویس و Enter بزن...",
  error,
  helperText,
  maxTags = 12,
  disabled = false,
  className,
}: TagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  const tags = parseTagsString(value);
  const atMax = tags.length >= maxTags;

  function addTag(raw: string) {
    const normalized = raw.trim().replace(/^#+/, "");
    if (!normalized) return;
    if (tags.includes(normalized)) {
      setDraft("");
      return;
    }
    if (tags.length >= maxTags) return;
    const next = [...tags, normalized];
    onChange(serializeTags(next));
    setDraft("");
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    onChange(serializeTags(next));
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      // Always prevent form submit when inside this input
      e.preventDefault();
      e.stopPropagation();
      addTag(draft);
      return;
    }

    if (e.key === "," || e.key === "،") {
      e.preventDefault();
      addTag(draft);
      return;
    }

    if (e.key === "Tab" && draft.trim()) {
      e.preventDefault();
      addTag(draft);
      return;
    }

    if (e.key === "Escape") {
      setDraft("");
      return;
    }

    if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      const next = tags.slice(0, -1);
      onChange(serializeTags(next));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    // Auto-add on comma/Persian comma typed
    if (val.endsWith(",") || val.endsWith("،")) {
      addTag(val.slice(0, -1));
    } else {
      setDraft(val);
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label row */}
      {label && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Hash className="size-4 text-primary" />
            <label className="text-sm font-black text-foreground">{label}</label>
          </div>
          {tags.length > 0 && (
            <span className="text-xs font-semibold text-muted">
              {toPersianDigits(tags.length)} از {toPersianDigits(maxTags)}
            </span>
          )}
        </div>
      )}

      {/* Field wrapper — click anywhere to focus input */}
      <div
        role="button"
        tabIndex={-1}
        onClick={() => inputRef.current?.focus()}
        onKeyDown={() => {}}
        className={cn(
          "min-h-12 cursor-text rounded-2xl border bg-card px-4 py-3 transition-all duration-200",
          "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-soft/35",
          error ? "border-danger" : "border-border",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {/* Chips */}
        {tags.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-xl bg-card-soft px-2.5 py-1 text-xs font-bold text-muted transition-colors hover:bg-primary-soft hover:text-primary-dark"
              >
                <span className="opacity-50">#</span>
                {tag}
                <button
                  type="button"
                  aria-label={`حذف تگ ${tag}`}
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="mr-0.5 flex size-4 items-center justify-center rounded-full text-muted/60 transition-colors hover:bg-danger/15 hover:text-danger"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Text input row */}
        <div className="flex items-center gap-2">
          {!label && <Hash className="size-4 shrink-0 text-muted" />}
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={atMax ? `حداکثر ${toPersianDigits(maxTags)} تگ` : placeholder}
            disabled={disabled || atMax}
            aria-invalid={Boolean(error)}
            dir="rtl"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted/60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Helper / error text */}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-danger">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs leading-5 text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
