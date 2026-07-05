import { createHash } from "node:crypto";
import { getPoemPreview } from "@/lib/poem-preview";

export interface GanjoorPoetSummary {
  id: number;
  nickname?: string | null;
  name?: string | null;
  fullUrl?: string | null;
  rootCatId?: number | null;
  published?: boolean | null;
  pinOrder?: number | null;
}

export interface GanjoorPoemImportRecord {
  ganjoorPoemId: number | null;
  poetName: string;
  poetSlug: string | null;
  title: string | null;
  plainText: string;
  excerpt: string;
  sourceUrl: string | null;
}

type GanjoorCatNode = {
  id: number;
  children?: GanjoorCatNode[] | null;
  poems?: Array<{ id: number }> | null;
};

const GANJOOR_BASE_URL = "https://api.ganjoor.net";

export const DEFAULT_IMPORT_POET_IDS = [
  2, 3, 5, 7, 22, 25, 26, 28, 29, 31, 32, 33, 34, 35, 40, 41,
];

function normalizePoemText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildPoemTextHash(text: string): string {
  return createHash("sha256").update(normalizePoemText(text)).digest("hex");
}

export function buildPoemExcerpt(text: string): string {
  const normalizedText = normalizePoemText(text);
  const preview = getPoemPreview(normalizedText, 2);
  return preview.text || normalizedText.slice(0, 220);
}

function inferPoetName(fullTitle?: string | null): string {
  if (!fullTitle) return "بی‌نام";
  const [poet] = fullTitle
    .split("»")
    .map((part) => part.trim())
    .filter(Boolean);
  return poet || "بی‌نام";
}

function inferPoetSlug(fullUrl?: string | null): string | null {
  if (!fullUrl) return null;
  const parts = fullUrl.split("/").filter(Boolean);
  return parts[0] || null;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${GANJOOR_BASE_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchGanjoorPoets(): Promise<GanjoorPoetSummary[]> {
  const data = await getJson<GanjoorPoetSummary[]>("/api/ganjoor/poets");
  if (!Array.isArray(data)) return [];

  return data
    .filter((poet) => poet.published !== false && typeof poet.rootCatId === "number")
    .sort((a, b) => {
      const aPinned = a.pinOrder ?? 9999;
      const bPinned = b.pinOrder ?? 9999;
      if (aPinned !== bPinned) return aPinned - bPinned;
      return (a.id ?? 0) - (b.id ?? 0);
    });
}

export async function fetchGanjoorPoetRootCat(poetId: number): Promise<GanjoorCatNode | null> {
  const data = await getJson<{ cat?: GanjoorCatNode | null }>(`/api/ganjoor/poet/${poetId}`);
  return data?.cat ?? null;
}

async function fetchGanjoorCat(catId: number): Promise<GanjoorCatNode | null> {
  const data = await getJson<{ cat?: GanjoorCatNode | null }>(`/api/ganjoor/cat/${catId}?poems=true`);
  return data?.cat ?? null;
}

async function collectPoemIdsFromCatId(
  catId: number,
  collector = new Set<number>(),
  visited = new Set<number>(),
): Promise<Set<number>> {
  if (visited.has(catId)) return collector;
  visited.add(catId);

  const node = await fetchGanjoorCat(catId);
  if (!node) return collector;

  for (const poem of node.poems ?? []) {
    if (typeof poem?.id === "number") collector.add(poem.id);
  }

  for (const child of node.children ?? []) {
    if (typeof child?.id === "number") {
      await collectPoemIdsFromCatId(child.id, collector, visited);
    }
  }

  return collector;
}

export async function fetchGanjoorPoemIdsByPoet(poetId: number): Promise<number[]> {
  const root = await fetchGanjoorPoetRootCat(poetId);
  if (!root?.id) return [];
  return [...(await collectPoemIdsFromCatId(root.id))].filter((id) => Number.isFinite(id));
}

export async function fetchGanjoorPoemById(poemId: number): Promise<GanjoorPoemImportRecord | null> {
  const data = await getJson<{
    id?: number;
    title?: string | null;
    fullTitle?: string | null;
    fullUrl?: string | null;
    plainText?: string | null;
  }>(`/api/ganjoor/poem/${poemId}`);

  const plainText = normalizePoemText(String(data?.plainText ?? ""));
  if (!plainText) return null;

  return {
    ganjoorPoemId: typeof data?.id === "number" ? data.id : poemId,
    poetName: inferPoetName(data?.fullTitle),
    poetSlug: inferPoetSlug(data?.fullUrl),
    title: data?.title ?? null,
    plainText,
    excerpt: buildPoemExcerpt(plainText),
    sourceUrl: data?.fullUrl ? `https://ganjoor.net${data.fullUrl}` : null,
  };
}

export async function buildDiverseGanjoorPoemIdPool() {
  const poetIds = [...DEFAULT_IMPORT_POET_IDS];

  const poemIds = new Set<number>();
  const perPoetCounts: Record<number, number> = {};
  const perPoetPoemIds: Record<number, number[]> = {};

  for (const poetId of poetIds) {
    const ids = await fetchGanjoorPoemIdsByPoet(poetId);
    perPoetCounts[poetId] = ids.length;
    perPoetPoemIds[poetId] = ids;
    for (const id of ids) poemIds.add(id);
  }

  const interleavedPoemIds: number[] = [];
  const maxLength = Math.max(...Object.values(perPoetPoemIds).map((ids) => ids.length), 0);
  for (let index = 0; index < maxLength; index++) {
    for (const poetId of poetIds) {
      const poemId = perPoetPoemIds[poetId]?.[index];
      if (typeof poemId === "number") interleavedPoemIds.push(poemId);
    }
  }

  return {
    poetIds,
    poemIds: interleavedPoemIds.filter((id, index, arr) => arr.indexOf(id) === index),
    perPoetCounts,
  };
}
