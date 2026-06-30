import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserEntries, createEntry } from "@/lib/entries";
import { entrySchema } from "@/lib/validations";
import type { EntryFilters } from "@/lib/entries";
import type { EntryType, EntryMood, EntryStatus } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters: EntryFilters = {
      type: (searchParams.get("type") as EntryType) || undefined,
      mood: (searchParams.get("mood") as EntryMood) || undefined,
      status: (searchParams.get("status") as EntryStatus) || undefined,
      q: searchParams.get("q") || undefined,
      tag: searchParams.get("tag") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    };

    const data = await getUserEntries(user.userId, filters);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: "اطلاعات واردشده معتبر نیست." } },
        { status: 400 }
      );
    }

    const entry = await createEntry(user.userId, parsed.data);
    return NextResponse.json({ ok: true, data: entry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}
