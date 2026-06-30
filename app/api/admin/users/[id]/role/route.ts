import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, updateUserRole } from "@/lib/admin";

const schema = z.object({
  role: z.enum(["user", "admin"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdmin();
    const { id: targetUserId } = await params;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: "نقش وارد‌شده معتبر نیست." } },
        { status: 400 }
      );
    }

    const result = await updateUserRole(
      adminSession.userId,
      targetUserId,
      parsed.data.role
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: { message: result.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}
