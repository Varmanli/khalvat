import type { DailyVerse } from "@/lib/poem-types";

export interface GanjoorFetchedPoem extends DailyVerse {
  ganjoorPoemId?: number;
  poetSlug?: string;
  title?: string;
  source?: string;
}

export const FALLBACK_VERSES: DailyVerse[] = [
  {
    text: "الا یا ایها الساقی ادر کأساً و ناولها\nکه عشق آسان نمود اول ولی افتاد مشکل‌ها",
    poet: "حافظ",
    source: "دیوان حافظ",
  },
  {
    text: "بشنو این نی چون شکایت می‌کند\nاز جدایی‌ها حکایت می‌کند",
    poet: "مولانا",
    source: "مثنوی معنوی",
  },
  {
    text: "بنی‌آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند",
    poet: "سعدی",
    source: "گلستان",
  },
  {
    text: "توانا بود هر که دانا بود\nز دانش دل پیر برنا بود",
    poet: "فردوسی",
    source: "شاهنامه",
  },
];

function compactWhitespace(value: string): string {
  return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function inferPoetName(fullTitle?: string | null): string | undefined {
  if (!fullTitle) return undefined;
  const [poet] = fullTitle.split("»").map((part) => part.trim()).filter(Boolean);
  return poet || undefined;
}

function inferPoetSlug(fullUrl?: string | null): string | undefined {
  if (!fullUrl) return undefined;
  const parts = fullUrl.split("/").filter(Boolean);
  return parts[0] || undefined;
}

export function getFallbackVerse(): DailyVerse {
  const idx = Math.floor(Math.random() * FALLBACK_VERSES.length);
  return FALLBACK_VERSES[idx];
}

export async function fetchGanjoorRandomPoem(
  signal?: AbortSignal,
  poetId = 0,
): Promise<GanjoorFetchedPoem | null> {
  try {
    const url = new URL("https://api.ganjoor.net/api/ganjoor/poem/random");
    url.searchParams.set("poetId", String(poetId));

    const res = await fetch(url, { signal, cache: "no-store" });
    if (!res.ok) return null;

    const data = await res.json();
    const plainText = compactWhitespace(String(data?.plainText ?? ""));
    if (!plainText) return null;

    const poetName =
      inferPoetName(data?.fullTitle) ??
      data?.poetName ??
      data?.authorName ??
      undefined;

    const fullUrl = data?.fullUrl ? `https://ganjoor.net${data.fullUrl}` : undefined;
    const excerpt = plainText.split("\n").slice(0, 2).join("\n").trim() || plainText;

    return {
      ganjoorPoemId: typeof data?.id === "number" ? data.id : undefined,
      poet: poetName,
      poetSlug: inferPoetSlug(data?.fullUrl),
      title: data?.title ?? undefined,
      text: plainText,
      excerpt,
      source: data?.fullTitle ?? data?.sourceName ?? data?.title ?? undefined,
      url: fullUrl,
    };
  } catch {
    return null;
  }
}
