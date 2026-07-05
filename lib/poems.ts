import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { poems } from "@/db/schema";
import { fetchGanjoorRandomPoem, getFallbackVerse, type GanjoorFetchedPoem } from "@/lib/ganjoor";
import {
  buildDiverseGanjoorPoemIdPool,
  buildPoemExcerpt,
  buildPoemTextHash,
  fetchGanjoorPoemById,
} from "@/lib/poem-import";
import type { DailyVerse } from "@/lib/poem-types";

export interface RandomPoemQuery {
  mood?: string | null;
  tag?: string | null;
  excludeIds?: string[];
  limit?: number;
}

function normalizePoemText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function poemToVerse(poem: typeof poems.$inferSelect): DailyVerse {
  return {
    id: poem.id,
    text: poem.plainText,
    excerpt: poem.excerpt ?? undefined,
    poet: poem.poetName,
    source: poem.title ?? undefined,
    url: poem.sourceUrl ?? undefined,
    tags: poem.tags ?? undefined,
    mood: poem.mood,
  };
}

async function getPoemByGanjoorId(ganjoorPoemId: number) {
  const rows = await db
    .select()
    .from(poems)
    .where(eq(poems.ganjoorPoemId, ganjoorPoemId))
    .limit(1);
  return rows[0] ?? null;
}

async function getPoemByTextHash(textHash: string) {
  const rows = await db
    .select()
    .from(poems)
    .where(eq(poems.textHash, textHash))
    .limit(1);
  return rows[0] ?? null;
}

export async function cacheGanjoorPoem(input: GanjoorFetchedPoem) {
  const normalizedText = normalizePoemText(input.text);
  const textHash = buildPoemTextHash(normalizedText);

  const existing =
    (input.ganjoorPoemId ? await getPoemByGanjoorId(input.ganjoorPoemId) : null) ??
    (await getPoemByTextHash(textHash));

  if (existing) {
    const rows = await db
      .update(poems)
      .set({
        ganjoorPoemId: existing.ganjoorPoemId ?? input.ganjoorPoemId ?? null,
        poetName: input.poet ?? existing.poetName,
        poetSlug: input.poetSlug ?? existing.poetSlug,
        title: input.title ?? existing.title,
        plainText: normalizedText,
        excerpt: input.excerpt ?? buildPoemExcerpt(normalizedText),
        sourceUrl: input.url ?? existing.sourceUrl,
        updatedAt: new Date(),
      })
      .where(eq(poems.id, existing.id))
      .returning();
    return rows[0];
  }

  const rows = await db
    .insert(poems)
    .values({
      ganjoorPoemId: input.ganjoorPoemId ?? null,
      textHash,
      poetName: input.poet ?? "بی‌نام",
      poetSlug: input.poetSlug ?? null,
      title: input.title ?? null,
      plainText: normalizedText,
      excerpt: input.excerpt ?? buildPoemExcerpt(normalizedText),
      sourceUrl: input.url ?? null,
      tags: null,
      mood: null,
      isActive: true,
    })
    .returning();

  return rows[0];
}

export async function fetchAndCacheGanjoorPoem() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const poem = await fetchGanjoorRandomPoem(controller.signal);
    if (!poem) return null;
    const cached = await cacheGanjoorPoem(poem);
    return poemToVerse(cached);
  } finally {
    clearTimeout(timer);
  }
}

export async function getRandomPoems(query: RandomPoemQuery = {}): Promise<DailyVerse[]> {
  const limit = Math.max(1, Math.min(query.limit ?? 1, 12));
  const filters = [eq(poems.isActive, true)];

  if (query.mood) {
    filters.push(eq(poems.mood, query.mood));
  }

  if (query.tag) {
    filters.push(sql`${poems.tags} ? ${query.tag}`);
  }

  const baseWhere = filters.length === 1 ? filters[0] : and(...filters);
  const excludedIds = (query.excludeIds ?? []).filter(Boolean);
  const activePoolSizeRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(poems)
    .where(eq(poems.isActive, true));
  const activePoolSize = activePoolSizeRow[0]?.count ?? 0;

  const filteredPoolRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(poems)
    .where(baseWhere);
  const filteredPoolSize = filteredPoolRow[0]?.count ?? 0;

  let whereClause = baseWhere;
  let candidateCount = filteredPoolSize;
  if (excludedIds.length > 0) {
    const excludedWhere = and(
      baseWhere,
      sql`${poems.id} not in (${sql.join(excludedIds.map((id) => sql`${id}`), sql`, `)})`
    );

    const excludedCountRow = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(poems)
      .where(excludedWhere);
    const remainingCount = excludedCountRow[0]?.count ?? 0;

    if (remainingCount >= limit) {
      whereClause = excludedWhere;
      candidateCount = remainingCount;
    }
  }

  const rows = await db
    .select()
    .from(poems)
    .where(whereClause)
    .orderBy(sql`random()`)
    .limit(limit);

  if (rows.length === 0) {
    const fetched = await fetchAndCacheGanjoorPoem();
    return fetched ? [fetched] : [getFallbackVerse()];
  }

  return rows.map((poem) => ({
    ...poemToVerse(poem),
    meta:
      process.env.NODE_ENV === "development"
        ? {
            activePoolSize,
            filteredPoolSize,
            candidateCount,
            excludeCount: excludedIds.length,
            requestedLimit: limit,
          }
        : undefined,
  }));
}

export async function getRandomPoem(query: RandomPoemQuery = {}): Promise<DailyVerse> {
  const poems = await getRandomPoems({ ...query, limit: 1 });
  return poems[0] ?? getFallbackVerse();
}

export async function importRandomGanjoorPoems(targetCount = 50, maxAttempts = targetCount * 20) {
  const sourcePool = await buildDiverseGanjoorPoemIdPool();
  const poemIds = sourcePool.poemIds;

  let imported = 0;
  let attempts = 0;
  let duplicateSkips = 0;
  let failedFetches = 0;
  let cursor = 0;

  while (imported < targetCount && attempts < maxAttempts && poemIds.length > 0) {
    attempts++;
    const poemId = poemIds[cursor % poemIds.length];
    cursor++;

    const poem = await fetchGanjoorPoemById(poemId);
    if (!poem) {
      failedFetches++;
      continue;
    }

    const before =
      (poem.ganjoorPoemId ? await getPoemByGanjoorId(poem.ganjoorPoemId) : null) ??
      (await getPoemByTextHash(buildPoemTextHash(poem.plainText)));

    await cacheGanjoorPoem({
      ganjoorPoemId: poem.ganjoorPoemId ?? undefined,
      poet: poem.poetName,
      poetSlug: poem.poetSlug ?? undefined,
      title: poem.title ?? undefined,
      text: poem.plainText,
      excerpt: poem.excerpt,
      url: poem.sourceUrl ?? undefined,
      source: poem.title ?? undefined,
    });
    if (!before) {
      imported++;
    } else {
      duplicateSkips++;
    }
  }

  const [activeRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(poems)
    .where(eq(poems.isActive, true));

  return {
    imported,
    attempts,
    duplicateSkips,
    failedFetches,
    sourcePoemIdPoolSize: poemIds.length,
    sourcePoetCount: sourcePool.poetIds.length,
    activePoemCount: activeRow?.count ?? 0,
  };
}

export async function getCachedPoemCount() {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(poems);
  return row?.count ?? 0;
}

export async function getRecentCachedPoems(limit = 20) {
  return db
    .select()
    .from(poems)
    .where(eq(poems.isActive, true))
    .orderBy(desc(poems.updatedAt))
    .limit(limit);
}

export async function getPoemStats() {
  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(poems);
  const [activeRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(poems)
    .where(eq(poems.isActive, true));
  const [ganjoorRow] = await db
    .select({ count: sql<number>`count(distinct ${poems.ganjoorPoemId})::int` })
    .from(poems)
    .where(isNotNull(poems.ganjoorPoemId));
  const [hashRow] = await db
    .select({ count: sql<number>`count(distinct ${poems.textHash})::int` })
    .from(poems);
  const [poetRow] = await db
    .select({ count: sql<number>`count(distinct ${poems.poetName})::int` })
    .from(poems);
  const [newestRow] = await db
    .select({ newest: sql<string | null>`max(${poems.updatedAt})::text` })
    .from(poems);

  return {
    totalPoems: totalRow?.count ?? 0,
    activePoems: activeRow?.count ?? 0,
    uniqueGanjoorPoemIds: ganjoorRow?.count ?? 0,
    uniqueTextHashes: hashRow?.count ?? 0,
    uniquePoets: poetRow?.count ?? 0,
    newestImportedAt: newestRow?.newest ?? null,
  };
}
