import { db } from "@/db";
import { entries, entryCategories, tags, entryTags } from "@/db/schema";
import { and, asc, desc, eq, gt, ilike, inArray, isNull, or } from "drizzle-orm";
import type { EntryType, EntryMood, EntryStatus } from "@/lib/constants";
import type { EntryInput } from "@/lib/validations";
import { assertEntryCategoryOwnership } from "@/lib/entry-categories";
import {
  parseTagsInput,
  syncEntryTags,
  getTagsForEntries,
  type TagInfo,
} from "@/lib/tags";

export interface EntryCategoryInfo {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

export interface EntryFilters {
  type?: EntryType;
  mood?: EntryMood;
  status?: EntryStatus;
  q?: string;
  tag?: string; // tag slug
  /** UUID to filter by category, "none" for entries without a category, or undefined for all. */
  categoryId?: string;
}

export interface EntryWithTags {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  content: string;
  type: EntryType;
  mood: EntryMood;
  status: EntryStatus;
  isPinned: boolean;
  reminderAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: TagInfo[];
  category: EntryCategoryInfo | null;
}

async function getCategoryMap(
  userId: string,
): Promise<Map<string, EntryCategoryInfo>> {
  const rows = await db
    .select()
    .from(entryCategories)
    .where(eq(entryCategories.userId, userId));
  return new Map(rows.map((r) => [r.id, r]));
}

export async function getUserEntries(
  userId: string,
  filters?: EntryFilters
): Promise<EntryWithTags[]> {
  const conditions = [eq(entries.userId, userId)];

  if (filters?.type) conditions.push(eq(entries.type, filters.type));
  if (filters?.mood) conditions.push(eq(entries.mood, filters.mood));
  if (filters?.status) conditions.push(eq(entries.status, filters.status));
  if (filters?.q) {
    conditions.push(
      or(
        ilike(entries.title, `%${filters.q}%`),
        ilike(entries.content, `%${filters.q}%`)
      )!
    );
  }
  if (filters?.categoryId === "none") {
    conditions.push(isNull(entries.categoryId));
  } else if (filters?.categoryId) {
    conditions.push(eq(entries.categoryId, filters.categoryId));
  }

  // Tag filter: find entryIds that have this tag
  if (filters?.tag) {
    const tagRow = await db
      .select({ id: tags.id })
      .from(tags)
      .where(and(eq(tags.userId, userId), eq(tags.slug, filters.tag)))
      .limit(1);

    if (!tagRow[0]) return []; // tag doesn't exist for this user

    const taggedEntries = await db
      .select({ entryId: entryTags.entryId })
      .from(entryTags)
      .where(eq(entryTags.tagId, tagRow[0].id));

    const ids = taggedEntries.map((r) => r.entryId);
    if (ids.length === 0) return [];

    conditions.push(inArray(entries.id, ids));
  }

  const rows = await db
    .select()
    .from(entries)
    .where(and(...conditions))
    .orderBy(desc(entries.isPinned), desc(entries.createdAt));

  const [tagMap, categoryMap] = await Promise.all([
    getTagsForEntries(rows.map((r) => r.id)),
    getCategoryMap(userId),
  ]);

  return rows.map((r) => ({
    ...r,
    type: r.type as EntryType,
    mood: r.mood as EntryMood,
    status: r.status as EntryStatus,
    tags: tagMap[r.id] ?? [],
    category: r.categoryId ? categoryMap.get(r.categoryId) ?? null : null,
  }));
}

export async function getUserEntryById(
  userId: string,
  entryId: string
): Promise<EntryWithTags | null> {
  const rows = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, entryId), eq(entries.userId, userId)))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];

  const [tagMap, categoryMap] = await Promise.all([
    getTagsForEntries([row.id]),
    getCategoryMap(userId),
  ]);

  return {
    ...row,
    type: row.type as EntryType,
    mood: row.mood as EntryMood,
    status: row.status as EntryStatus,
    tags: tagMap[row.id] ?? [],
    category: row.categoryId ? categoryMap.get(row.categoryId) ?? null : null,
  };
}

export async function createEntry(
  userId: string,
  data: EntryInput
): Promise<EntryWithTags> {
  const categoryId = await assertEntryCategoryOwnership(userId, data.categoryId);

  const rows = await db
    .insert(entries)
    .values({
      userId,
      categoryId,
      title: data.title,
      content: data.content,
      type: data.type,
      mood: data.mood,
      status: data.status,
      isPinned: data.isPinned ?? false,
      reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
    })
    .returning();

  const entry = rows[0];
  const tagNames = parseTagsInput(data.tags ?? "");
  await syncEntryTags(userId, entry.id, tagNames);

  const [tagMap, categoryMap] = await Promise.all([
    getTagsForEntries([entry.id]),
    getCategoryMap(userId),
  ]);
  return {
    ...entry,
    type: entry.type as EntryType,
    mood: entry.mood as EntryMood,
    status: entry.status as EntryStatus,
    tags: tagMap[entry.id] ?? [],
    category: entry.categoryId ? categoryMap.get(entry.categoryId) ?? null : null,
  };
}

export async function updateEntry(
  userId: string,
  entryId: string,
  data: Partial<EntryInput>
): Promise<EntryWithTags | null> {
  const categoryId =
    data.categoryId !== undefined
      ? await assertEntryCategoryOwnership(userId, data.categoryId)
      : undefined;

  const rows = await db
    .update(entries)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.mood !== undefined && { mood: data.mood }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      ...(categoryId !== undefined && { categoryId }),
      ...(data.reminderAt !== undefined && {
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
      }),
      updatedAt: new Date(),
    })
    .where(and(eq(entries.id, entryId), eq(entries.userId, userId)))
    .returning();

  if (!rows[0]) return null;
  const entry = rows[0];

  // Sync tags only if tags field was explicitly provided
  if (data.tags !== undefined) {
    const tagNames = parseTagsInput(data.tags ?? "");
    await syncEntryTags(userId, entryId, tagNames);
  }

  const [tagMap, categoryMap] = await Promise.all([
    getTagsForEntries([entry.id]),
    getCategoryMap(userId),
  ]);
  return {
    ...entry,
    type: entry.type as EntryType,
    mood: entry.mood as EntryMood,
    status: entry.status as EntryStatus,
    tags: tagMap[entry.id] ?? [],
    category: entry.categoryId ? categoryMap.get(entry.categoryId) ?? null : null,
  };
}

export async function deleteEntry(userId: string, entryId: string) {
  await db
    .delete(entries)
    .where(and(eq(entries.id, entryId), eq(entries.userId, userId)));
}

export interface UpcomingReminder {
  id: string;
  title: string;
  type: string;
  reminderAt: Date;
}

export async function getUpcomingReminders(
  userId: string,
  limit = 3,
): Promise<UpcomingReminder[]> {
  const now = new Date();
  const rows = await db
    .select({
      id: entries.id,
      title: entries.title,
      type: entries.type,
      reminderAt: entries.reminderAt,
    })
    .from(entries)
    .where(and(eq(entries.userId, userId), gt(entries.reminderAt, now)))
    .orderBy(asc(entries.reminderAt))
    .limit(limit);
  return rows.filter(
    (r): r is typeof r & { reminderAt: Date } => r.reminderAt !== null,
  );
}
