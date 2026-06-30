import { requireUser } from "@/lib/auth";
import { getUserSettings } from "@/lib/settings";
import { PreferencesSettingsForm } from "@/components/settings/preferences-settings-form";
import { SlidersHorizontal } from "lucide-react";

export const metadata = { title: "ترجیحات — تنظیمات خلوت" };

export default async function PreferencesSettingsPage() {
  const session = await requireUser();
  const { user, prefs } = await getUserSettings(session.userId);

  if (!user) return null;

  return (
    <div className="space-y-1">
      <PageHeader
        icon={SlidersHorizontal}
        title="ترجیحات"
        subtitle="چند انتخاب کوچک برای شکل تجربه روزانه‌ات."
      />
      <SettingsPageCard>
        <PreferencesSettingsForm
          defaultHome={prefs?.defaultHome ?? "dashboard"}
          showDailyVerse={prefs?.showDailyVerse ?? true}
          showGuideCards={prefs?.showGuideCards ?? true}
        />
      </SettingsPageCard>
    </div>
  );
}

function PageHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/35 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function SettingsPageCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-visible rounded-[2.25rem] border border-border bg-linear-to-br from-card via-background to-primary-soft/10 p-6 shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-8">
      {children}
    </div>
  );
}
