import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteAccountSchema } from "@/lib/validations";
import { deleteUserAccount } from "@/lib/account-deletion";

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "برای ادامه باید وارد حساب شوید." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "داده‌های ارسالی معتبر نیستند.";
      return NextResponse.json(
        { ok: false, error: { message } },
        { status: 400 }
      );
    }

    const result = await deleteUserAccount(user.userId, parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: { message: result.message } },
        { status: 400 }
      );
    }

    // Clear auth cookie
    const cookieStore = await cookies();
    cookieStore.delete("khalvat_token");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { message: "حذف حساب با خطا مواجه شد. دوباره تلاش کن." },
      },
      { status: 500 }
    );
  }
}
