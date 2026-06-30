import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations";
import { updateUserProfile } from "@/lib/settings";

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
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "داده‌های ارسالی معتبر نیستند.";
      return NextResponse.json(
        { ok: false, error: { message } },
        { status: 400 }
      );
    }

    await updateUserProfile(user.userId, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}
