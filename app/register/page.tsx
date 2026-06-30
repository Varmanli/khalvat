"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock, Eye, EyeOff, Feather } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok) {
      toast.success("حساب ساخته شد. خوش اومدی!");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(json.error?.message ?? "خطایی رخ داد.");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-12 order-1">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-8">
            <Image src="/logo.png" alt="لوگوی خلوت" width={36} height={36} className="rounded-xl object-contain" />
            <span className="font-bold text-primary">خلوت</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            خلوت خودت را بساز
          </h1>
          <p className="text-sm text-muted mb-7">
            یک فضای شخصی برای فکرها، حس‌ها و جرقه‌هایت.
          </p>

          {/* Google OAuth */}
          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary-soft hover:shadow-sm transition-all duration-150 mb-5"
          >
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              G
            </span>
            ادامه با گوگل
          </a>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">یا</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="نام"
              type="text"
              placeholder="اسمت چیه؟"
              icon={<User size={15} />}
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="ایمیل"
              type="email"
              placeholder="example@email.com"
              dir="ltr"
              icon={<Mail size={15} />}
              {...register("email")}
              error={errors.email?.message}
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
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register("password")}
              error={errors.password?.message}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
              {isSubmitting ? "در حال ساخت حساب..." : "ساخت حساب"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            حساب داری؟{" "}
            <Link href="/login" className="text-primary hover:underline">
              وارد شو
            </Link>
          </p>
        </div>
      </div>

      {/* Decorative side */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-card border-r border-border px-12 order-2">
        <blockquote className="text-center max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-6">
            <Feather size={22} className="text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground mb-4 leading-relaxed">
            «هر فکری که ارزش نوشتن دارد، ارزش نگه داشتن هم دارد.»
          </p>
          <p className="text-sm text-muted">— خلوت</p>
        </blockquote>
        <div className="mt-12 grid grid-cols-2 gap-2 w-full max-w-xs opacity-70">
          {[
            { label: "یادداشت", color: "bg-card-soft" },
            { label: "ایده", color: "bg-[#DDE7C7]" },
            { label: "شعر", color: "bg-[#F0D1D6]" },
            { label: "یادآور", color: "bg-[#F3D6A4]" },
          ].map(({ label, color }) => (
            <div key={label} className={`${color} rounded-xl px-3 py-2 text-center text-xs text-foreground border border-border`}>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

