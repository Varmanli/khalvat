import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserEntryById, updateEntry, deleteEntry } from "@/lib/entries";
import { entrySchema } from "@/lib/validations";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const entry = await getUserEntryById(user.userId, id);
    if (!entry) {
      return NextResponse.json(
        { ok: false, error: { message: "نوشته پیدا نشد." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: entry });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = entrySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: "اطلاعات واردشده معتبر نیست." } },
        { status: 400 }
      );
    }

    const entry = await updateEntry(user.userId, id, parsed.data);
    if (!entry) {
      return NextResponse.json(
        { ok: false, error: { message: "نوشته پیدا نشد." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: entry });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await getUserEntryById(user.userId, id);
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: { message: "نوشته پیدا نشد." } },
        { status: 404 }
      );
    }

    await deleteEntry(user.userId, id);
    return NextResponse.json({ ok: true, data: { message: "نوشته پاک شد." } });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}
