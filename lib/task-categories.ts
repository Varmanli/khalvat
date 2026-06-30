import { db } from "@/db";
import { taskCategories } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { TaskCategoryInput } from "@/lib/validations";

function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^؀-ۿa-zA-Z0-9-]/g, "")
    .toLowerCase();
}

async function uniqueSlug(userId: string, base: string): Promise<string> {
  let slug = slugify(base) || "category";
  const existing = await db
    .select({ slug: taskCategories.slug })
    .from(taskCategories)
    .where(eq(taskCategories.userId, userId));
  const slugs = new Set(existing.map((r) => r.slug));
  if (!slugs.has(slug)) return slug;
  let n = 2;
  while (slugs.has(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

export async function getUserTaskCategories(userId: string) {
  return db
    .select()
    .from(taskCategories)
    .where(eq(taskCategories.userId, userId))
    .orderBy(taskCategories.createdAt);
}

export async function createTaskCategory(userId: string, data: TaskCategoryInput) {
  const slug = await uniqueSlug(userId, data.name);
  const rows = await db
    .insert(taskCategories)
    .values({ userId, name: data.name, slug, color: data.color ?? "#8A5A44" })
    .returning();
  return rows[0];
}

export async function updateTaskCategory(
  userId: string,
  categoryId: string,
  data: Partial<TaskCategoryInput>
) {
  const rows = await db
    .update(taskCategories)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.color !== undefined && { color: data.color }),
      updatedAt: new Date(),
    })
    .where(and(eq(taskCategories.id, categoryId), eq(taskCategories.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteTaskCategory(userId: string, categoryId: string) {
  await db
    .delete(taskCategories)
    .where(and(eq(taskCategories.id, categoryId), eq(taskCategories.userId, userId)));
}
