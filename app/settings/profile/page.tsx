import { User } from "lucide-react";

import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { requireUser } from "@/lib/auth";
import { getUserSettings } from "@/lib/settings";

export const metadata = { title: "پروفایل — تنظیمات خلوت" };

export default async function ProfileSettingsPage() {
  const session = await requireUser();
  const { user } = await getUserSettings(session.userId);

  if (!user) return null;

  return (
    <div className="relative min-w-0 overflow-x-clip">
      <section className="relative overflow-x-clip rounded-[2.25rem] border border-border bg-card p-4 shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/10" />
        <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex items-start gap-3 border-b border-border pb-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/50 text-primary-dark">
              <User className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-muted">پروفایل</p>
              <h1 className="mt-1 text-xl font-black text-foreground sm:text-2xl">
                اطلاعات پروفایل
              </h1>
              <p className="mt-1 text-xs leading-6 text-muted sm:text-sm">
                نام، معرفی کوتاه و ظاهر آواتارت را مدیریت کن.
              </p>
            </div>
          </div>

          <ProfileSettingsForm
            initialName={user.name}
            initialBio={user.bio}
            initialAvatarIcon={user.avatarIcon}
            initialAvatarColor={user.avatarColor}
            email={user.email}
          />
        </div>
      </section>
    </div>
  );
}
