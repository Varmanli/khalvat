"use client";

import { useEffect, useState } from "react";
import { VerseCard } from "@/components/verse-card";
import { cn } from "@/lib/utils";
import type { DailyVerse } from "@/lib/poem-types";

const RECENT_POEM_IDS_KEY = "khalvat:recent-poem-ids";
const RECENT_POEM_IDS_LIMIT = 24;
const claimedPoemIds = new Set<string>();

interface RandomVerseCardProps {
  variant?: "hero" | "compact" | "inline" | "side";
  title?: string;
  subtitle?: string;
  showCopy?: boolean;
  className?: string;
}

function readRecentPoemIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_POEM_IDS_KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeRecentPoemIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    RECENT_POEM_IDS_KEY,
    JSON.stringify(ids.slice(-RECENT_POEM_IDS_LIMIT)),
  );
}

function getExcludedPoemIds() {
  return [...new Set([...readRecentPoemIds(), ...claimedPoemIds])];
}

export function RandomVerseCard({
  variant = "compact",
  title,
  subtitle,
  showCopy = true,
  className,
}: RandomVerseCardProps) {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const recentIds = getExcludedPoemIds();
        const params = new URLSearchParams();
        if (recentIds.length > 0) {
          params.set("excludeIds", recentIds.join(","));
        }
        params.set("limit", "1");

        const res = await fetch(`/api/poems/random?${params.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!json.ok || ignore) return;

        const nextVerse = Array.isArray(json.poems) ? json.poems[0] : null;
        if (!nextVerse) return;

        setVerse(nextVerse);

        if (typeof nextVerse.id === "string") {
          claimedPoemIds.add(nextVerse.id);
          const updated = [...readRecentPoemIds().filter((id) => id !== nextVerse.id), nextVerse.id];
          writeRecentPoemIds(updated);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]",
          className,
        )}
      >
        <div className="mb-4 h-4 w-24 rounded-full bg-card-soft" />
        <div className="space-y-2 rounded-3xl bg-background/60 p-4">
          <div className="h-4 w-full rounded-full bg-card-soft" />
          <div className="h-4 w-4/5 rounded-full bg-card-soft" />
          <div className="h-4 w-2/3 rounded-full bg-card-soft" />
        </div>
      </div>
    );
  }

  if (!verse?.text) return null;

  return (
    <VerseCard
      verse={verse}
      variant={variant}
      title={title}
      subtitle={subtitle}
      showCopy={showCopy}
      className={className}
    />
  );
}
