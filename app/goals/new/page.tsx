import Link from "next/link";
import { ArrowLeft, Sparkles, Target } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { GoalForm } from "@/components/goals/goal-form";
import { requireUser } from "@/lib/auth";

export default async function NewGoalPage() {
  await requireUser();

  return (
    <AppShell>
      <div className="relative mx-auto max-w-3xl overflow-x-clip">
        <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-primary-soft/20 blur-3xl" />

        <div className="relative space-y-5">
          <Link
            href="/goals"
            className="inline-flex items-center gap-1.5 text-xs font-black text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5 rotate-180" />
            بازگشت به هدف‌ها
          </Link>

          <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/15" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-tl-[5rem] bg-primary/7" />

            <div className="relative">
              <div className="mb-8 flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
                  <Target className="size-5" />
                </span>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted">
                    <Sparkles className="size-3.5 text-gold" />
                    مسیر تازه
                  </div>

                  <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
                    هدف جدیدت رو بساز
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                    فقط مسیرت رو مشخص کن؛ جزئیات رو می‌تونی قدم‌به‌قدم کامل کنی.
                  </p>
                </div>
              </div>

              <GoalForm />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
