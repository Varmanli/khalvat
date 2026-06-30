"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeaderSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setMobileOpen(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setMobileOpen(false);
  }

  // function goSearch() {
  //   if (q.trim()) {
  //     router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  //   } else {
  //     router.push("/search");
  //   }
  //   setMobileOpen(false);
  // }

  return (
    <>
      {/* Desktop search input — hidden on small screens */}
      <form
        onSubmit={submit}
        className="hidden md:flex items-center gap-2 flex-1 max-w-xs"
      >
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو در خلوت..."
            className="w-full h-9 pr-9 pl-10 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary transition-colors duration-150"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 text-[10px] text-muted border border-border rounded px-1 py-0.5 select-none pointer-events-none">
            ⌘K
          </span>
        </div>
      </form>

      {/* Mobile search icon button */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl text-muted hover:text-foreground hover:bg-card-soft transition-colors"
        aria-label="جستجو"
      >
        <Search size={16} />
      </button>

      {/* Mobile expandable search bar — slides under header */}
      {mobileOpen && (
        <div className="md:hidden fixed top-14.25 right-0 left-0 z-40 bg-card border-b border-border px-4 py-2 shadow-md">
          <form onSubmit={submit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                autoFocus
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو در خلوت..."
                className="w-full h-10 pr-9 pl-3 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-primary text-white rounded-2xl text-sm font-medium hover:bg-primary-dark transition-colors shrink-0"
            >
              جستجو
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="text-xs text-muted hover:text-foreground shrink-0"
            >
              بستن
            </button>
          </form>
        </div>
      )}
    </>
  );
}

