"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pendingLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  confirming?: boolean;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "انصراف",
  pendingLabel = "در حال حذف...",
  onConfirm,
  onClose,
  confirming = false,
}: ConfirmationDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !confirming) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirming, onClose, open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === overlayRef.current && !confirming) {
          onClose();
        }
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_40px_120px_rgba(0,0,0,0.28)]">
        <div className="relative overflow-hidden border-b border-border bg-danger/8 px-6 py-5">
          <div className="pointer-events-none absolute -left-8 -top-8 size-28 rounded-full bg-danger/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-danger/12 text-danger">
                <AlertTriangle className="size-5" />
              </span>

              <div>
                <h2 className="text-base font-black text-foreground">{title}</h2>
                <p className="mt-0.5 text-xs text-muted">این عمل برگشت‌پذیر نیست</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={confirming}
              className="flex size-8 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-card-soft disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="بستن"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl border border-danger/20 bg-danger/6 px-4 py-3.5 text-sm leading-7 text-foreground">
            {description}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="inline-flex items-center gap-2 rounded-2xl bg-danger px-5 py-2.5 text-sm font-black text-white shadow-[0_8px_28px_rgba(185,74,72,0.32)] transition-all hover:-translate-y-0.5 hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
          >
            {confirming ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
