import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const [user] = await db
    .select({ notificationOnboardingSeen: users.notificationOnboardingSeen })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return NextResponse.json({
    ok: true,
    data: { shouldPrompt: Boolean(user && !user.notificationOnboardingSeen) },
  });
}

export async function POST() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  await db
    .update(users)
    .set({ notificationOnboardingSeen: true, updatedAt: new Date() })
    .where(eq(users.id, session.userId));

  return NextResponse.json({ ok: true });
}
