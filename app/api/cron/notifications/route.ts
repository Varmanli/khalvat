import { NextResponse } from "next/server";
import { processDueNotifications } from "@/lib/notifications";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? new URL(request.url).searchParams.get("secret"); if (!process.env.NOTIFICATION_CRON_SECRET || secret !== process.env.NOTIFICATION_CRON_SECRET) return NextResponse.json({ ok: false }, { status: 401 }); return NextResponse.json({ ok: true, ...(await processDueNotifications()) }); }
