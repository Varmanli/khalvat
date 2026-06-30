import { db } from "@/db";
import { entryCategories } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { EntryCategoryInput } from "@/lib/validations";

export async function getUserEntryCategories(userId: string) {
  return db
    .select()
    .from(entryCategories)
    .where(eq(entryCategories.userId, userId))
    .orderBy(entryCategories.createdAt);
}

export async function createEntryCategory(
  userId: string,
  data: EntryCategoryInput,
) {
  const rows = await db
    .insert(entryCategories)
    .values({
      userId,
      name: data.name,
      color: data.color ?? "#8A5A44",
      icon: data.icon ?? null,
    })
    .returning();
  return rows[0];
}

export async function updateEntryCategory(
  userId: string,
  categoryId: string,
  data: Partial<EntryCategoryInput>,
) {
  const rows = await db
    .update(entryCategories)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
      updatedAt: new Date(),
    })
    .where(
      and(eq(entryCategories.id, categoryId), eq(entryCategories.userId, userId)),
    )
    .returning();
  return rows[0] ?? null;
}

export async function deleteEntryCategory(userId: string, categoryId: string) {
  await db
    .delete(entryCategories)
    .where(
      and(eq(entryCategories.id, categoryId), eq(entryCategories.userId, userId)),
    );
}

/** Verifies a category id belongs to the user; returns it or null if invalid/foreign. */
export async function assertEntryCategoryOwnership(
  userId: string,
  categoryId: string | null | undefined,
): Promise<string | null> {
  if (!categoryId) return null;
  const rows = await db
    .select({ id: entryCategories.id })
    .from(entryCategories)
    .where(
      and(eq(entryCategories.id, categoryId), eq(entryCategories.userId, userId)),
    )
    .limit(1);
  return rows[0] ? categoryId : null;
}
