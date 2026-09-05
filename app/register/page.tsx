"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { khalvatLogo } from "@/lib/branding";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Feather,
  Lock,
  Mail,
  PenLine,
  Quote,
  Sparkles,
  User,
} from "lucide-react";

import { registerSchema, type RegisterInput } from "@/lib/validations";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!json.ok) {
        toast.error(json.error?.message ?? "خطایی رخ داد.");

        return;
      }

      toast.success("حساب ساخته شد. خوش اومدی!");

      router.push("/today");
    } catch {
      toast.error("ساخت حساب انجام نشد. دوباره تلاش کن.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-112 rounded-full bg-primary-soft/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 right-0 size-120 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(28rem,.85fr)]">
        {/* Form side */}
        <main className="order-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Brand */}
            <Link href="/" className="mb-9 inline-flex">
              <Image
                src={khalvatLogo}
                unoptimized
                alt="خلوت"
                width={320}
                height={110}
                priority
                className="h-20 w-auto object-contain"
              />
            </Link>

            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
                <Sparkles className="size-3.5 text-gold" />
                شروع یک خلوت تازه
              </div>

              <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
                فضای خودت رو
                <span className="mx-2 text-primary-dark">بساز</span>
              </h1>

              <p className="mt-3 max-w-md text-sm leading-7 text-muted">
                یک جای شخصی برای فکرها، برنامه‌ها، یادداشت‌ها و چیزهایی که
                نمی‌خوای گم بشن.
              </p>
            </div>

            {/* Google OAuth */}
            <a
              href="/api/auth/google"
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card/80 px-4 text-sm font-black text-foreground shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-card hover:shadow-[0_12px_30px_rgba(94,58,47,0.07)]"
            >
              <span className="flex size-8 items-center justify-center rounded-xl bg-background text-sm font-black text-primary-dark shadow-sm">
                G
              </span>
              ادامه با گوگل
              <ArrowLeft className="size-4 text-muted transition-transform group-hover:-translate-x-0.5" />
            </a>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />

              <span className="text-[11px] font-bold text-muted">
                یا با ایمیل
              </span>

              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="نام"
                type="text"
                placeholder="اسمت چیه؟"
                icon={<User size={15} />}
                {...register("name")}
                error={errors.name?.message}
                className="h-12 rounded-2xl border-border bg-card/75"
              />

              <Input
                label="ایمیل"
                type="email"
                placeholder="example@email.com"
                dir="ltr"
                icon={<Mail size={15} />}
                {...register("email")}
                error={errors.email?.message}
                className="h-12 rounded-2xl border-border bg-card/75"
              />

              <Input
                label="رمز عبور"
                type={showPassword ? "text" : "password"}
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
                icon={<Lock size={15} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="flex size-8 items-center justify-center rounded-xl text-muted transition-colors hover:bg-card-soft hover:text-foreground"
                    aria-label={
                      showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"
                    }
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                {...register("password")}
                error={errors.password?.message}
                className="h-12 rounded-2xl border-border bg-card/75"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 h-12 w-full rounded-2xl bg-linear-to-l from-primary-dark via-primary to-primary text-sm font-black text-white shadow-[0_16px_38px_rgba(138,90,68,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(138,90,68,0.28)]"
              >
                {isSubmitting ? (
                  "در حال ساخت حساب..."
                ) : (
                  <>
                    ساخت خلوت من
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              قبلاً حساب ساختی؟{" "}
              <Link
                href="/login"
                className="font-black text-primary-dark transition-colors hover:text-primary"
              >
                وارد شو
              </Link>
            </p>
          </div>
        </main>

        {/* Visual side */}
        <aside className="relative order-2 hidden overflow-hidden border-r border-border bg-card/65 lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/25" />

          <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-gold/15 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-tl-[10rem] bg-primary/8" />

          <div className="relative flex w-full items-center justify-center px-10 py-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <span className="flex size-14 items-center justify-center rounded-[1.35rem] bg-primary-soft/55 text-primary-dark shadow-sm">
                  <Feather className="size-6" />
                </span>

                <blockquote className="mt-6">
                  <Quote className="mb-3 size-5 text-gold" />

                  <p className="text-2xl font-black leading-[1.9] text-foreground">
                    هر چیزی که برات مهمه، یه جا برای موندن لازم داره.
                  </p>
                </blockquote>
              </div>

              <div className="relative">
                <div className="absolute -inset-5 rounded-4xl bg-primary-soft/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-4xl border border-border bg-card/82 p-5 shadow-[0_20px_70px_rgba(94,58,47,0.08)]">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-muted">خلوت تو</p>

                      <p className="mt-1 text-base font-black text-foreground">
                        از همین‌جا شروع می‌شه
                      </p>
                    </div>

                    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                      <PenLine className="size-4" />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "یادداشت",
                        description: "چیزی که توی ذهنت مونده",
                      },
                      {
                        label: "هدف",
                        description: "مسیرهایی که می‌خوای بری",
                      },
                      {
                        label: "وظیفه",
                        description: "قدم بعدی امروز",
                      },
                      {
                        label: "عادت",
                        description: "چیزهای کوچیک تکرارشونده",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-border bg-background/55 p-3.5"
                      >
                        <span className="mb-3 block size-2 rounded-full bg-primary/60" />

                        <p className="text-sm font-black text-foreground">
                          {item.label}
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-muted">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-background/70 p-4">
                    <p className="text-sm leading-7 text-muted">
                      لازم نیست از روز اول همه‌چیز کامل باشه؛ خلوتت کم‌کم با
                      خودت شکل می‌گیره.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
