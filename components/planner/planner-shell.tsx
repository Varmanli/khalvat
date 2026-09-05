import type { ReactNode } from "react";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { users } from "@/db/schema";
export async function PlannerShell({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const [user] = await db
    .select({
      name: users.name,
      avatarIcon: users.avatarIcon,
      avatarColor: users.avatarColor,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return (
    <AppShell
      userName={user?.name}
      userAvatarIcon={user?.avatarIcon}
      userAvatarColor={user?.avatarColor}
      isAdmin={user?.role === "admin"}
    >
      {children}
    </AppShell>
  );
}
