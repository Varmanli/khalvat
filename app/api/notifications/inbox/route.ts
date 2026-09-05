import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getInbox, markRead } from "@/lib/notifications";
export async function GET() { const user = await getCurrentUser(); if (!user) return NextResponse.json({ ok: false }, { status: 401 }); const data = await getInbox(user.userId); return NextResponse.json({ ok: true, data, unread: data.filter(item => !item.readAt).length }); }
export async function PATCH(request: Request) { const user = await getCurrentUser(); if (!user) return NextResponse.json({ ok: false }, { status: 401 }); const body = await request.json().catch(() => ({})); await markRead(user.userId, body.id); return NextResponse.json({ ok: true }); }
