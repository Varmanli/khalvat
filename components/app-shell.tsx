import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DailyCheckInPrompt } from "@/components/check-ins/daily-check-in-prompt";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userAvatarIcon?: string | null;
  userAvatarColor?: string | null;
  isAdmin?: boolean;
}

export async function AppShell({
  children,
  userName,
  userAvatarIcon,
  userAvatarColor,
  isAdmin,
}: AppShellProps) {
  const session = await getCurrentUser();
  const [account] = session
    ? await db
        .select({
          name: users.name,
          avatarIcon: users.avatarIcon,
          avatarColor: users.avatarColor,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1)
    : [];
  const resolvedIsAdmin = isAdmin ?? account?.role === "admin";
  const resolvedUserName = account?.name ?? userName;
  const resolvedAvatarIcon = account?.avatarIcon ?? userAvatarIcon ?? "leaf";
  const resolvedAvatarColor = account?.avatarColor ?? userAvatarColor ?? "#8A5A44";
  return (
    <div className="min-h-screen flex flex-col bg-background lg:pr-72">
      <SiteHeader
        userName={resolvedUserName}
        userAvatarIcon={resolvedAvatarIcon}
        userAvatarColor={resolvedAvatarColor}
        isAdmin={resolvedIsAdmin}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 pb-28 pt-6 sm:px-5 sm:py-8 lg:px-8 lg:pb-8">
        {children}
      </main>

      <SiteFooter />
      <DailyCheckInPrompt />
    </div>
  );
}
