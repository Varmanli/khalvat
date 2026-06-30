import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { requireUser } from "@/lib/auth";
import { getUserSettings } from "@/lib/settings";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireUser();
  const { user } = await getUserSettings(session.userId);

  if (!user) return null;

  const isAdmin =
    user.role === "admin" ||
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)
      .includes(user.email);

  return (
    <AppShell
      userName={user.name}
      userAvatarIcon={user.avatarIcon}
      userAvatarColor={user.avatarColor}
      isAdmin={isAdmin}
    >
      <div className="relative">
        <div className="pointer-events-none absolute -top-12 right-0 size-80 rounded-full bg-primary-soft/22 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 size-80 rounded-full bg-gold/12 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-1/3 size-72 rounded-full bg-card-soft/45 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <SettingsHero
            userName={user.name}
            userEmail={user.email}
            avatarIcon={user.avatarIcon}
            avatarColor={user.avatarColor}
            isAdmin={isAdmin}
          />

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="min-w-0 xl:order-1 xl:sticky xl:top-28 xl:self-start">
              <SettingsSidebar
                userName={user.name}
                userEmail={user.email}
                userAvatarIcon={user.avatarIcon}
                userAvatarColor={user.avatarColor}
              />
            </aside>

            <main className="min-w-0 xl:order-2">
              <div className="relative">
                <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-gold/8 blur-3xl" />
                <div className="relative">{children}</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SettingsHero({
  userName,
  userEmail,
  avatarIcon,
  avatarColor,
  isAdmin,
}: {
  userName: string | null;
  userEmail: string;
  avatarIcon?: string | null;
  avatarColor?: string | null;
  isAdmin: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.1)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/18" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-tl-[8rem] bg-primary/8" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <Link
              href="/dashboard"
              className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
            >
              <ArrowLeft className="size-3.5 rotate-180" />
              داشبورد
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              فضای شخصی تو در خلوت
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              تنظیمات حساب
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              چند چیز کوچک برای اینکه خلوت بیشتر شبیه فضای خودت باشد؛ از نام و
              آواتار تا ترجیح‌های روزانه.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMiniCard
              icon={<Settings className="size-4" />}
              label="حساب"
              text="پروفایل و امنیت"
            />
            <HeroMiniCard
              icon={<Sparkles className="size-4" />}
              label="ظاهر"
              text="آواتار و رنگ"
            />
            <HeroMiniCard
              icon={<LayoutDashboard className="size-4" />}
              label="تجربه"
              text="صفحه شروع و راهنماها"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/82 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.08)]">
            <div className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full bg-gold/12 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar
                    icon={avatarIcon}
                    color={avatarColor}
                    name={userName}
                    size="lg"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-foreground">
                      {userName || "کاربر خلوت"}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-soft/45 px-3 py-1.5 text-[11px] font-black text-primary-dark">
                    <BadgeCheck className="size-3.5" />
                    مدیر
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <PreviewRow
                  title="پروفایل"
                  text="نام، بیوگرافی کوتاه و آواتار"
                />
                <PreviewRow title="امنیت" text="تغییر رمز عبور و دسترسی حساب" />
                <PreviewRow
                  title="ترجیحات"
                  text="شکل تجربه روزانه‌ات در خلوت"
                />
              </div>

              <div className="mt-5 rounded-2xl bg-background/70 p-4">
                <p className="text-sm leading-7 text-muted">
                  اینجا قرار نیست تنظیمات پیچیده داشته باشی؛ فقط چند انتخاب کوچک
                  که خلوت را شخصی‌تر می‌کند.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMiniCard({
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

        <div>
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="mt-1 text-sm font-black text-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/62 px-3 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        <Sparkles className="size-3.5" />
      </span>

      <div>
        <p className="text-xs font-black text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] leading-5 text-muted">{text}</p>
      </div>
    </div>
  );
}
