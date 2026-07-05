"use client";

export function OfflineRetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded-2xl border border-border bg-background/75 px-5 py-3 text-sm font-black text-foreground transition-colors hover:border-primary-soft hover:text-primary"
    >
      تلاش دوباره
    </button>
  );
}
