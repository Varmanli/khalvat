export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6"
    >
      <span className="sr-only">در حال آماده‌کردن برنامه…</span>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="h-6 w-36 animate-pulse rounded-lg bg-card-soft" />
          <div className="h-3.5 w-52 animate-pulse rounded-md bg-card-soft/70" />
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-card-soft" />
              <div className="h-3 w-32 animate-pulse rounded-md bg-card-soft/60" />
            </div>

            <div className="h-9 w-20 animate-pulse rounded-xl bg-card-soft" />
          </div>

          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-border/50 p-3"
              >
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-card-soft" />

                <div className="flex-1 space-y-2">
                  <div
                    className={`h-3.5 animate-pulse rounded-md bg-card-soft ${
                      item === 1 ? "w-1/2" : "w-2/3"
                    }`}
                  />
                  <div className="h-3 w-20 animate-pulse rounded-md bg-card-soft/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
