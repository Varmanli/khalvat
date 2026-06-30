import bcrypt from "bcryptjs";
import { db } from "@/db";
import {
  users,
  entries,
  entryTags,
  entryCategories,
  tags,
  tasks,
  taskCategories,
  gratitudeEntries,
  habits,
  habitLogs,
  habitCategories,
  authAccounts,
  userPreferences,
} from "@/db/schema";
import { count, eq, inArray } from "drizzle-orm";

const CONFIRMATION_PHRASE = "حذف حساب";

// ── Preview ───────────────────────────────────────────────────────

export async function getAccountDeletionPreview(userId: string) {
  const [
    [entriesRow],
    [tasksRow],
    [gratitudeRow],
    [habitsRow],
    [habitLogsRow],
    [tagsRow],
    [prefsRow],
  ] = await Promise.all([
    db.select({ total: count() }).from(entries).where(eq(entries.userId, userId)),
    db.select({ total: count() }).from(tasks).where(eq(tasks.userId, userId)),
    db.select({ total: count() }).from(gratitudeEntries).where(eq(gratitudeEntries.userId, userId)),
    db.select({ total: count() }).from(habits).where(eq(habits.userId, userId)),
    db.select({ total: count() }).from(habitLogs).where(eq(habitLogs.userId, userId)),
    db.select({ total: count() }).from(tags).where(eq(tags.userId, userId)),
    db.select({ total: count() }).from(userPreferences).where(eq(userPreferences.userId, userId)),
  ]);

  return {
    entriesCount: entriesRow?.total ?? 0,
    tasksCount: tasksRow?.total ?? 0,
    gratitudeCount: gratitudeRow?.total ?? 0,
    habitsCount: habitsRow?.total ?? 0,
    habitLogsCount: habitLogsRow?.total ?? 0,
    tagsCount: tagsRow?.total ?? 0,
    hasPreferences: (prefsRow?.total ?? 0) > 0,
  };
}

// ── Delete ────────────────────────────────────────────────────────

interface DeleteInput {
  confirmationPhrase: string;
  currentPassword?: string;
  emailConfirmation?: string;
}

export async function deleteUserAccount(
  userId: string,
  input: DeleteInput
): Promise<{ ok: boolean; message?: string }> {
  // 1. Load user
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return { ok: false, message: "کاربر پیدا نشد." };

  // 2. Verify confirmation phrase
  if (input.confirmationPhrase !== CONFIRMATION_PHRASE) {
    return { ok: false, message: "عبارت تأیید درست نیست." };
  }

  // 3. Verify password or email
  if (user.passwordHash) {
    if (!input.currentPassword) {
      return { ok: false, message: "رمز عبور فعلی الزامی است." };
    }
    const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!valid) {
      return { ok: false, message: "رمز عبور فعلی درست نیست." };
    }
  } else {
    if (!input.emailConfirmation) {
      return { ok: false, message: "تأیید ایمیل الزامی است." };
    }
    const emailMatch =
      input.emailConfirmation.trim().toLowerCase() === user.email.toLowerCase();
    if (!emailMatch) {
      return { ok: false, message: "ایمیل واردشده با حساب شما یکی نیست." };
    }
  }

  // 4. Delete in explicit order inside a transaction
  await db.transaction(async (tx) => {
    // Habit logs
    await tx.delete(habitLogs).where(eq(habitLogs.userId, userId));

    // Habits (and their logs via cascade, but already deleted above)
    const userHabitIds = await tx
      .select({ id: habits.id })
      .from(habits)
      .where(eq(habits.userId, userId));

    if (userHabitIds.length > 0) {
      await tx.delete(habits).where(eq(habits.userId, userId));
    }

    // Habit categories
    await tx.delete(habitCategories).where(eq(habitCategories.userId, userId));

    // Tasks
    await tx.delete(tasks).where(eq(tasks.userId, userId));

    // Task categories
    await tx.delete(taskCategories).where(eq(taskCategories.userId, userId));

    // Entry tags (via entries cascade, but explicit)
    const userEntryIds = await tx
      .select({ id: entries.id })
      .from(entries)
      .where(eq(entries.userId, userId));

    if (userEntryIds.length > 0) {
      const ids = userEntryIds.map((r) => r.id);
      await tx.delete(entryTags).where(inArray(entryTags.entryId, ids));
    }

    // Entries
    await tx.delete(entries).where(eq(entries.userId, userId));

    // Entry categories
    await tx.delete(entryCategories).where(eq(entryCategories.userId, userId));

    // Tags
    await tx.delete(tags).where(eq(tags.userId, userId));

    // Gratitude entries
    await tx.delete(gratitudeEntries).where(eq(gratitudeEntries.userId, userId));

    // User preferences
    await tx.delete(userPreferences).where(eq(userPreferences.userId, userId));

    // Auth accounts (OAuth links)
    await tx.delete(authAccounts).where(eq(authAccounts.userId, userId));

    // Finally: delete the user
    await tx.delete(users).where(eq(users.id, userId));
  });

  return { ok: true };
}
