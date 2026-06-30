import { db } from "@/db";
import { users, userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// ── Read ──────────────────────────────────────────────────────────

export async function getUserSettings(userId: string) {
  const [userRow, prefsRow] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarIcon: users.avatarIcon,
        avatarColor: users.avatarColor,
        bio: users.bio,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1),
  ]);

  const user = userRow[0] ?? null;
  const prefs = prefsRow[0] ?? null;

  return { user, prefs };
}

// ── Profile update ────────────────────────────────────────────────

export async function updateUserProfile(
  userId: string,
  data: {
    name: string;
    bio?: string | null;
    avatarIcon: string;
    avatarColor: string;
  }
) {
  await db
    .update(users)
    .set({
      name: data.name,
      bio: data.bio ?? null,
      avatarIcon: data.avatarIcon,
      avatarColor: data.avatarColor,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ── Password update ───────────────────────────────────────────────

export async function updateUserPassword(
  userId: string,
  data: { currentPassword: string; newPassword: string }
): Promise<{ ok: boolean; message?: string }> {
  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return { ok: false, message: "کاربر پیدا نشد." };
  if (!row.passwordHash) {
    return {
      ok: false,
      message:
        "حساب شما با گوگل ایجاد شده است و رمز عبور ندارد. می‌توانید مستقیم از گوگل وارد شوید.",
    };
  }

  const valid = await bcrypt.compare(data.currentPassword, row.passwordHash);
  if (!valid) return { ok: false, message: "رمز عبور فعلی اشتباه است." };

  const newHash = await bcrypt.hash(data.newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { ok: true };
}

// ── Preferences update ────────────────────────────────────────────

export async function updateUserPreferences(
  userId: string,
  data: {
    defaultHome: string;
    showDailyVerse: boolean;
    showGuideCards: boolean;
  }
) {
  const existing = await db
    .select({ id: userPreferences.id })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userPreferences)
      .set({
        defaultHome: data.defaultHome,
        showDailyVerse: data.showDailyVerse,
        showGuideCards: data.showGuideCards,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId));
  } else {
    await db.insert(userPreferences).values({
      userId,
      defaultHome: data.defaultHome,
      showDailyVerse: data.showDailyVerse,
      showGuideCards: data.showGuideCards,
    });
  }
}
