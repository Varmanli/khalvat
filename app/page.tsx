import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const siteUrl = process.env.APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  alternates: { canonical: siteUrl },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "خلوت",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  inLanguage: "fa-IR",
  description:
    "خلوت یک دفتر دیجیتال شخصی و بولت ژورنال آنلاین برای ثبت نوشته‌ها، ایده‌ها، وظایف، شکرگزاری، عادت‌ها، یادآورها و شعر روز است.",
  url: siteUrl,
};
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Feather,
  Heart,
  Layers,
  Lightbulb,
  ListTodo,
  Moon,
  PenLine,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";

import { PublicHeader } from "@/components/public-header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="overflow-hidden">
        <HeroSection />
        <FeatureSection />
        <DailyFlowSection />
        <MoodsSection />
        <PrivacySection />
        <FinalCtaSection />
      </main>

      <SiteFooter />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-primary-soft/30 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-40 size-80 rounded-full bg-gold/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 size-72 rounded-full bg-card-soft/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14 lg:px-8 lg:pb-28 lg:pt-20 xl:gap-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-black text-muted shadow-sm">
            <Sparkles className="size-3.5 text-gold" />
            دفتر بولت ژورنال آنلاین
          </div>

          <h1 className="text-4xl font-black leading-[1.35] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            برای هر چیزی که در ذهنت
            <span className="relative mx-2 inline-block text-primary">
              می‌ماند،
              <span className="absolute -bottom-1 right-0 -z-10 h-3 w-full rounded-full bg-primary-soft/45" />
            </span>
            <br />
            یک جای آرام داشته باش.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            خلوت یک دفتر دیجیتال شخصی برای نوشته‌ها، وظیفه‌ها، شکرگزاری‌ها،
            عادت‌های کوچک، یادآورها و تکه‌های شعر است؛ جایی برای فکرهایی که
            نمی‌خواهی بین شلوغی روز گم شوند.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_42px_rgba(138,90,68,0.24)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              ساخت خلوت من
              <ArrowLeft className="size-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-black text-foreground shadow-sm transition-all hover:border-primary-soft hover:bg-primary-soft/20"
            >
              ورود به دفترم
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            <HeroPill
              icon={<PenLine className="size-4" />}
              title="نوشتن آرام"
              text="یادداشت، شعر، ایده"
            />
            <HeroPill
              icon={<ListTodo className="size-4" />}
              title="روزمره سبک"
              text="وظیفه و یادآور"
            />
            <HeroPill
              icon={<Heart className="size-4" />}
              title="حال بهتر"
              text="شکرگزاری و عادت"
            />
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative hidden lg:block">
      <div className="pointer-events-none absolute -right-8 -top-8 size-52 rounded-full bg-primary-soft/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 size-48 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative rounded-[2.5rem] border border-border bg-card p-3 shadow-[0_34px_120px_rgba(94,58,47,0.16)]">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border bg-card-soft px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-danger/70" />
              <span className="size-3 rounded-full bg-warning/70" />
              <span className="size-3 rounded-full bg-success/70" />
            </div>

            <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1 text-[11px] font-black text-muted">
              <Moon className="size-3.5 text-primary" />
              خلوت امروز
            </div>

            <span className="w-12" />
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-[1.75rem] border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted">امروز</p>
                  <h3 className="mt-1 text-lg font-black text-foreground">
                    چی توی ذهنت مانده؟
                  </h3>
                </div>

                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
                  <Sparkles className="size-5" />
                </span>
              </div>

              <div className="space-y-3">
                <MockEntryCard
                  icon={<Lightbulb className="size-4" />}
                  title="ایده برای نسخه بعدی پروژه"
                  meta="ایده · امیدوار"
                />
                <MockEntryCard
                  icon={<Quote className="size-4" />}
                  title="یک بیت که باید برگردم کاملش کنم"
                  meta="شعر · نوستالژیک"
                />
                <MockEntryCard
                  icon={<Bell className="size-4" />}
                  title="فردا به این موضوع سر بزن"
                  meta="یادآور · آرام"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniDashboardCard
                icon={<ListTodo className="size-4" />}
                title="وظایف امروز"
                value="۳"
                text="بدون فشار، فقط قدم بعدی"
              />
              <MiniDashboardCard
                icon={<Heart className="size-4" />}
                title="شکرگزاری"
                value="۱"
                text="یک دلیل کوچک برای لبخند"
              />
            </div>

            <div className="rounded-[1.75rem] border border-border bg-linear-to-br from-card via-background to-gold/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-black text-muted">
                <BookOpen className="size-4 text-primary" />
                شعر روز
              </div>

              <p className="text-sm font-bold leading-8 text-foreground">
                «دمی با غم به سر بردن جهان یکسر نمی‌ارزد»
              </p>

              <p className="mt-2 text-xs text-muted">
                یک مکث کوتاه، قبل از ادامه روز.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FloatingNote className="-right-8 top-14" text="آرام‌تر بنویس" />
      <FloatingNote className="-left-5 bottom-24" text="رد عادت‌های کوچک" />
    </div>
  );
}

function FeatureSection() {
  const features = [
    {
      icon: <PenLine className="size-5" />,
      title: "نوشته‌های شخصی",
      desc: "هر فکری که ارزش ماندن دارد؛ کوتاه، بلند، خام یا کامل.",
    },
    {
      icon: <ListTodo className="size-5" />,
      title: "وظیفه‌های روزمره",
      desc: "کارهایت را بدون حس فشار و شلوغی، مرتب و قابل انجام نگه دار.",
    },
    {
      icon: <Heart className="size-5" />,
      title: "شکرگزاری",
      desc: "چند خط برای چیزهایی که قشنگ بودند، حتی اگر خیلی کوچک باشند.",
    },
    {
      icon: <CalendarCheck className="size-5" />,
      title: "عادت‌های کوچک",
      desc: "رد عادت‌هایت را آرام‌آرام دنبال کن؛ بدون سرزنش و سخت‌گیری.",
    },
    {
      icon: <Bell className="size-5" />,
      title: "یادآورهای آرام",
      desc: "چیزهایی که نباید گم شوند، با لحنی آرام دوباره جلویت می‌آیند.",
    },
    {
      icon: <BookOpen className="size-5" />,
      title: "شعر روز",
      desc: "یک تکه شعر برای مکث کوتاه؛ درست وسط روزمرگی‌ها.",
    },
    {
      icon: <Tag className="size-5" />,
      title: "تگ و دسته‌بندی",
      desc: "نوشته‌ها و فکرهایت را با برچسب‌های خودت پیدا کن.",
    },
    {
      icon: <Search className="size-5" />,
      title: "آرشیو قابل جستجو",
      desc: "هر چیزی که نوشته‌ای، بعداً دوباره پیدا می‌شود.",
    },
  ];

  return (
    <section
      id="features"
      className="relative scroll-mt-24 border-y border-border bg-card py-20 sm:py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute left-0 top-0 size-80 rounded-full bg-gold/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="چیزهایی که خلوت نگه می‌دارد"
          title="یک دفتر برای فکر، کار، حال و عادت"
          subtitle="خلوت فقط جای یادداشت نیست؛ یک فضای شخصی برای نظم نرم روزهای توست."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyFlowSection() {
  const steps = [
    {
      icon: <Feather className="size-5" />,
      title: "بنویس",
      text: "هرچه توی ذهنت مانده را بدون قالب سخت ثبت کن.",
    },
    {
      icon: <Layers className="size-5" />,
      title: "مرتب کن",
      text: "با نوع نوشته، تگ، حال‌وهوا و دسته‌بندی پیدایش کن.",
    },
    {
      icon: <CheckCircle2 className="size-5" />,
      title: "ادامه بده",
      text: "وظیفه‌ها، عادت‌ها و شکرگزاری‌ها آرام مسیر روزت را نگه می‌دارند.",
    },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[440px_minmax(0,1fr)] lg:items-center lg:gap-14">
        <div>
          <SectionHeader
            align="right"
            eyebrow="جریان روزانه"
            title="خلوت مثل یک میز نوشتن همیشه آماده است."
            subtitle="قرار نیست همه‌چیز را پیچیده کند؛ فقط کمک می‌کند هر چیز جای خودش را داشته باشد."
          />

          <div className="mt-8 space-y-3">
            {steps.map((step, index) => (
              <FlowStep key={step.title} index={index + 1} {...step} />
            ))}
          </div>
        </div>

        <div className="relative rounded-[2.5rem] border border-border bg-card p-4 shadow-[0_28px_100px_rgba(94,58,47,0.1)]">
          <div className="absolute -left-8 -top-8 size-56 rounded-full bg-primary-soft/22 blur-3xl" />

          <div className="relative grid gap-4 md:grid-cols-2">
            <JournalCard
              icon={<PenLine className="size-5" />}
              title="صفحه امروز"
              text="یک جای خلوت برای نوشتن چیزهایی که هنوز شکل نگرفته‌اند."
            />
            <JournalCard
              icon={<ListTodo className="size-5" />}
              title="وظیفه‌های نرم"
              text="کارهای کوچک، بدون حس سنگینی و فشار."
            />
            <JournalCard
              icon={<Heart className="size-5" />}
              title="چند خط شکرگزاری"
              text="رد چیزهای خوبی که شاید اگر ننویسی، از یادت بروند."
            />
            <JournalCard
              icon={<CalendarCheck className="size-5" />}
              title="عادت‌ها"
              text="آرام‌آرام جلو برو؛ اگر امروز نشد، فردا دوباره ادامه بده."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MoodsSection() {
  const moods = [
    { label: "آرام", className: "bg-card-soft text-muted" },
    { label: "نوستالژیک", className: "bg-gold/14 text-primary-dark" },
    { label: "امیدوار", className: "bg-olive/12 text-olive" },
    { label: "خسته", className: "bg-border/45 text-muted" },
    { label: "عاشقانه", className: "bg-rose/12 text-rose" },
    { label: "تاریک", className: "bg-foreground text-background" },
    { label: "پرانرژی", className: "bg-warning/16 text-warning" },
    { label: "غمگین", className: "bg-primary-soft/30 text-primary-dark" },
  ];

  return (
    <section
      id="moods"
      className="scroll-mt-24 border-y border-border bg-card-soft/50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="حال‌وهوای نوشته‌ها"
          title="چون نوشته‌ها فقط متن نیستند."
          subtitle="هر صفحه می‌تواند حال خودش را داشته باشد؛ آرام، امیدوار، خسته یا حتی تاریک."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {moods.map((mood) => (
            <span
              key={mood.label}
              className={`rounded-full px-5 py-2.5 text-sm font-black shadow-sm ${mood.className}`}
            >
              {mood.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section id="about" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-6 shadow-[0_26px_100px_rgba(94,58,47,0.09)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/14" />
        <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/12 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted">
              <ShieldCheck className="size-3.5 text-primary" />
              فضای شخصی
            </div>

            <h2 className="text-2xl font-black leading-tight text-foreground sm:text-3xl">
              خلوت قرار نیست شلوغت کند؛ قرار است کمی جا باز کند.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted sm:text-base">
              اینجا خبری از شبکه اجتماعی، نمایش عمومی و مسابقه بهره‌وری نیست.
              خلوت برای فکرهای شخصی توست؛ برای نوشتن، برگشتن و آرام‌تر مرتب کردن
              روزها.
            </p>
          </div>

          <div className="grid gap-3">
            <TrustCard
              icon={<ShieldCheck className="size-4" />}
              text="شخصی و دور از شلوغی"
            />
            <TrustCard
              icon={<Moon className="size-4" />}
              text="طراحی آرام و گرم"
            />
            <TrustCard
              icon={<Star className="size-4" />}
              text="مناسب نوشتن روزانه"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="relative border-t border-border bg-card py-24 text-center sm:py-28">
      <div className="pointer-events-none absolute right-1/2 top-0 size-80 translate-x-1/2 rounded-full bg-primary-soft/24 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-6 flex justify-center">
          <div className="rounded-[1.75rem] border border-border bg-background p-3 shadow-[0_18px_54px_rgba(94,58,47,0.1)]">
            <Image
              src="/logo.png"
              alt="لوگوی خلوت"
              width={64}
              height={64}
              className="rounded-2xl object-contain"
            />
          </div>
        </div>

        <h2 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
          امشب اولین صفحه خلوتت را بنویس.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-muted sm:text-base">
          یک صفحه کوتاه، یک عادت کوچک، یا فقط یک جمله برای چیزی که امروز آرامت
          کرد.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-black text-white shadow-[0_18px_42px_rgba(138,90,68,0.24)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            شروع رایگان
            <ArrowLeft className="size-4" />
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-primary-soft bg-background px-7 py-3.5 text-sm font-black text-primary transition-colors hover:bg-primary-soft/25"
          >
            ورود
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroPill({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-card/75 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
          {icon}
        </span>
        <div>
          <p className="text-sm font-black text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted">{text}</p>
        </div>
      </div>
    </div>
  );
}

function MockEntryCard({
  icon,
  title,
  meta,
}: {
  icon: ReactNode;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm font-black text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted">{meta}</p>
      </div>
    </div>
  );
}

function MiniDashboardCard({
  icon,
  title,
  value,
  text,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft/35 text-primary">
          {icon}
        </span>
        <span className="text-xl font-black text-primary-dark">{value}</span>
      </div>

      <p className="text-sm font-black text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
    </div>
  );
}

function FloatingNote({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-2xl border border-border bg-card/90 px-4 py-3 text-xs font-black text-foreground shadow-[0_18px_60px_rgba(94,58,47,0.12)] backdrop-blur-xl ${className ?? ""}`}
    >
      {text}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  align?: "center" | "right";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"
      }
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-black text-muted shadow-sm">
        <Sparkles className="size-3.5 text-gold" />
        {eyebrow}
      </div>

      <h2 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-8 text-muted sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-background p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-soft hover:shadow-[0_20px_70px_rgba(94,58,47,0.08)]">
      <div className="pointer-events-none absolute -left-12 -top-12 size-32 rounded-full bg-primary-soft/12 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary-soft/35 text-primary-dark">
          {icon}
        </span>

        <h3 className="text-base font-black text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-muted">{desc}</p>
      </div>
    </div>
  );
}

function FlowStep({
  icon,
  title,
  text,
  index,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  index: number;
}) {
  return (
    <div className="flex gap-3 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/40 text-primary-dark">
        {icon}
      </span>

      <div>
        <p className="text-xs font-black text-muted">قدم {index}</p>
        <h3 className="mt-1 text-sm font-black text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-6 text-muted">{text}</p>
      </div>
    </div>
  );
}

function JournalCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-background/70 p-5">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-card-soft text-primary">
        {icon}
      </span>

      <h3 className="text-base font-black text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
    </div>
  );
}

function TrustCard({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft/35 text-primary">
        {icon}
      </span>
      <p className="text-sm font-black text-foreground">{text}</p>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card-soft py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 md:flex-row md:text-right lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="لوگوی خلوت"
            width={36}
            height={36}
            className="rounded-xl object-contain"
          />
          <div>
            <p className="text-sm font-black text-foreground">خلوت</p>
            <p className="mt-1 text-xs text-muted">دفتر دیجیتال شخصی</p>
          </div>
        </div>

        <p className="text-xs leading-6 text-muted">
          ساخته شده برای نوشتن آرام‌تر، فکر کردن روشن‌تر، و برگشتن به چیزهای
          کوچک.
        </p>
      </div>
    </footer>
  );
}
