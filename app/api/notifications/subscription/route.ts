import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { savePushSubscription } from "@/lib/notifications";
import { z } from "zod";
const schema = z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }) });
export async function POST(request: Request) { const user = await getCurrentUser(); if (!user) return NextResponse.json({ ok: false }, { status: 401 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ ok: false, error: { message: "اشتراک معتبر نیست." } }, { status: 400 }); await savePushSubscription(user.userId, parsed.data, request.headers.get("user-agent") ?? undefined); return NextResponse.json({ ok: true }); }
