import type { ReactNode } from "react";
import { BadgeCheck, Mail, Palette, Sparkles, User } from "lucide-react";

import { UserAvatar } from "@/components/avatar/user-avatar";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { requireUser } from "@/lib/auth";
import { getUserSettings } from "@/lib/settings";

export const metadata = { title: "پروفایل — تنظیمات خلوت" };

export default async function ProfileSettingsPage() {
  const session = await requireUser();
  const { user } = await getUserSettings(session.userId);

  if (!user) return null;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.08)]">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/14" />
        <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-gold/12 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 size-44 rounded-tl-[6rem] bg-primary/8" />

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-start lg:justify-between">
            <PageHeader
              icon={<User className="size-5" />}
              eyebrow="پروفایل"
              title="چهره‌ی تو در خلوت"
              subtitle="نام، ایمیل و آواتاری که در فضای شخصی‌ات دیده می‌شود."
            />

            <div className="shrink-0 rounded-[1.75rem] border border-border bg-background/70 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <UserAvatar
                  icon={user.avatarIcon}
                  color={user.avatarColor}
                  name={user.name}
                  size="lg"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">
                    {user.name || "کاربر خلوت"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ProfileMiniCard
              icon={<User className="size-4" />}
              label="نام نمایشی"
              text={user.name || "بدون نام"}
            />
            <ProfileMiniCard
              icon={<Mail className="size-4" />}
              label="ایمیل"
              text="برای ورود و حساب"
            />
            <ProfileMiniCard
              icon={<Palette className="size-4" />}
              label="آواتار"
              text="آیکون و رنگ شخصی"
            />
          </div>
        </div>
      </section>

      <SettingsPageCard>
        <div className="mb-6 flex items-start gap-3 border-b border-border pb-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark shadow-[0_12px_32px_rgba(94,58,47,0.1)]">
            <BadgeCheck className="size-5" />
          </span>

          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
              <Sparkles className="size-3.5 text-gold" />
              اطلاعات حساب
            </div>

            <h2 className="text-lg font-black text-foreground">
              ویرایش پروفایل
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
              نامی که خلوت با آن صدایت می‌زند و آواتار کوچکی که کنار نوشته‌ها و
              منوها دیده می‌شود.
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
      </SettingsPageCard>
    </div>
  );
}

function PageHeader({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark shadow-[0_12px_32px_rgba(94,58,47,0.1)]">
        {icon}
      </span>

      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
          <Sparkles className="size-3.5 text-gold" />
          {eyebrow}
        </div>

        <h1 className="text-2xl font-black leading-tight text-foreground sm:text-3xl">
          {title}
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function ProfileMiniCard({
  icon,
  label,
  text,
}: {
  icon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-card/75 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="mt-1 truncate text-sm font-black text-foreground">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsPageCard({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-visible rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-linear-to-br from-card via-background to-primary-soft/10" />
      <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative">{children}</div>
    </section>
  );
}
