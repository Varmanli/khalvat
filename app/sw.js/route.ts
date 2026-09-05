import { developmentWorker, productionWorker } from "@/lib/pwa-worker";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(
    process.env.NODE_ENV === "production"
      ? productionWorker.replaceAll("__BUILD_VERSION__", process.env.NEXT_PUBLIC_PWA_VERSION!)
      : developmentWorker,
    {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "Service-Worker-Allowed": "/",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
