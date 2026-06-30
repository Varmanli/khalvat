"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyVerseButtonProps {
  text: string;
  poet?: string;
  source?: string;
}

export function CopyVerseButton({ text, poet, source }: CopyVerseButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const parts = [text];
    if (poet || source) {
      parts.push(`— ${[poet, source].filter(Boolean).join("، ")}`);
    }
    await navigator.clipboard.writeText(parts.join("\n"));
    setCopied(true);
    toast.success("بیت کپی شد");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-bold text-muted transition-all duration-200 hover:border-primary-soft hover:bg-primary-soft/30 hover:text-primary-dark"
    >
      {copied ? (
        <Check className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5" />
      )}
      کپی بیت
    </button>
  );
}
