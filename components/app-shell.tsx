import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userAvatarIcon?: string | null;
  userAvatarColor?: string | null;
  isAdmin?: boolean;
}

export function AppShell({
  children,
  userName,
  userAvatarIcon,
  userAvatarColor,
  isAdmin,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader
        userName={userName}
        userAvatarIcon={userAvatarIcon}
        userAvatarColor={userAvatarColor}
        isAdmin={isAdmin}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
