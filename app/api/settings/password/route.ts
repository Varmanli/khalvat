import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updatePasswordSchema } from "@/lib/validations";
import { updateUserPassword } from "@/lib/settings";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updatePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "داده‌های ارسالی معتبر نیستند.";
      return NextResponse.json(
        { ok: false, error: { message } },
        { status: 400 }
      );
    }

    const result = await updateUserPassword(user.userId, parsed.data);
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
