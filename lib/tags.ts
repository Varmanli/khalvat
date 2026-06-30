import { db } from "@/db";
import { tags, entryTags } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export interface TagInfo {
  id: string;
  name: string;
  slug: string;
}

/** Trim and normalize whitespace. */
export function normalizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** Create a URL-safe slug from a tag name (supports Persian/Arabic). */
export function createTagSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    // Keep Persian/Arabic letters, Latin letters, digits, hyphens
    .replace(/\s+/g, "-")
    .replace(
      /[^؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿a-z0-9-]/g,
      ""
    )
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || name.trim().replace(/\s+/g, "-");
}

/**
 * Parse a free-form tags string.
 * Tags are separated ONLY by comma or Persian comma — spaces are preserved inside a tag.
 *   "ایده, سریال, شعر"           → ["ایده", "سریال", "شعر"]
 *   "بسم الله, امید"              → ["بسم الله", "امید"]
 *   "#بسم الله الرحمن الرحیم"    → ["بسم الله الرحمن الرحیم"]
 */
export function parseTagsInput(input: string): string[] {
  if (!input.trim()) return [];
  return [
    ...new Set(
      input
        .split(/[,،]/)
        .map((t) => normalizeTagName(t.replace(/^#+/, "")))
        .filter(Boolean)
    ),
  ];
}

/**
 * Upsert tags for a user and sync the entry_tags join table.
 * Idempotent: calling with the same tags produces the same result.
 */
export async function syncEntryTags(
  userId: string,
  entryId: string,
  tagNames: string[]
) {
  // Delete existing associations first
  await db.delete(entryTags).where(eq(entryTags.entryId, entryId));

  if (tagNames.length === 0) return;

  const tagIds: string[] = [];

  for (const rawName of tagNames) {
    const name = normalizeTagName(rawName);
    const slug = createTagSlug(name);
    if (!slug) continue;

    // Upsert: insert or update (keeps the name current)
    const result = await db
      .insert(tags)
      .values({ userId, name, slug })
      .onConflictDoUpdate({
        target: [tags.userId, tags.slug],
        set: { name },
      })
      .returning({ id: tags.id });

    if (result[0]) tagIds.push(result[0].id);
  }

  if (tagIds.length > 0) {
    await db
      .insert(entryTags)
      .values(tagIds.map((tagId) => ({ entryId, tagId })));
  }
}

/**
 * Get all tags for multiple entries in two queries (no N+1).
 * Returns a map of entryId → TagInfo[].
 */
export async function getTagsForEntries(
  entryIds: string[]
): Promise<Record<string, TagInfo[]>> {
  if (entryIds.length === 0) return {};

  const rows = await db
    .select({
      entryId: entryTags.entryId,
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(entryTags)
    .innerJoin(tags, eq(entryTags.tagId, tags.id))
    .where(inArray(entryTags.entryId, entryIds));

  const map: Record<string, TagInfo[]> = {};
  for (const row of rows) {
    if (!map[row.entryId]) map[row.entryId] = [];
    map[row.entryId].push({ id: row.id, name: row.name, slug: row.slug });
  }
  return map;
}

/** Get recent tags for a user (for dashboard). */
export async function getUserRecentTags(
  userId: string,
  limit = 8
): Promise<TagInfo[]> {
  return db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(desc(tags.createdAt))
    .limit(limit);
}
