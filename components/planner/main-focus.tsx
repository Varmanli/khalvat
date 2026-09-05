"use client";

import { useState } from "react";
import { Focus, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MainFocus({
  date,
  initialFocus,
}: {
  date: string;
  initialFocus: string;
}) {
  const [focus, setFocus] = useState(initialFocus);
  const [saved, setSaved] = useState(initialFocus);
  const [pending, setPending] = useState(false);

  const hasChanges = focus !== saved;

  return (
    <Card className="relative overflow-hidden rounded-4xl border border-border bg-card/72 p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-5">
      <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-primary-soft/20 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
            <Focus className="size-4" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black text-foreground">
                تمرکز اصلی امروز
              </h2>

              {saved && !hasChanges && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft/35 px-2.5 py-1 text-[11px] font-bold text-primary-dark">
                  <Sparkles className="size-3" />
                  ثبت شده
                </span>
              )}
            </div>

            <p className="mt-1 text-xs leading-5 text-muted">
              مهم‌ترین کاری که می‌خواهی امروز جلو ببری را اینجا نگه دار.
            </p>
          </div>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();

            setPending(true);

            try {
              const response = await fetch("/api/planner", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  date,
                  focus,
                }),
              });

              if (!response.ok) {
                throw new Error();
              }

              setSaved(focus);

              toast.success("اولویت روز ذخیره شد.");
            } catch {
              toast.error("ذخیره نشد. دوباره تلاش کنید.");
            } finally {
              setPending(false);
            }
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <Input
              label="اولویت روز"
              maxLength={255}
              value={focus}
              disabled={pending}
              onChange={(event) => setFocus(event.target.value)}
              placeholder="مثلاً: تمام کردن طراحی صفحه امروز"
              className="h-12 rounded-2xl border-border bg-background/70 px-4 shadow-none transition-colors focus-visible:border-primary-soft focus-visible:ring-primary-soft/30"
            />
          </div>

          <Button
            type="submit"
            disabled={pending || !hasChanges}
            className="h-12 shrink-0 rounded-2xl px-5 font-black shadow-sm sm:min-w-28"
          >
            {pending ? (
              "در حال ذخیره…"
            ) : (
              <>
                <Save className="size-4" />
                ذخیره
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
