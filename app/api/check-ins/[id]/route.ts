import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteUserCheckInById } from "@/lib/check-ins";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await deleteUserCheckInById(user.userId, id);

    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: { message: "ثبت حال روز پیدا نشد." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: { message: "ثبت حال روز حذف شد." } });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد." } },
      { status: 500 }
    );
  }
}
