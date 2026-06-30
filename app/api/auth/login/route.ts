import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validations";
import { signToken, createAuthCookie } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: "اطلاعات واردشده معتبر نیست." } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { ok: false, error: { message: "ایمیل یا رمز عبور اشتباه است." } },
        { status: 401 }
      );
    }

    // OAuth-only user — has no password
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message:
              "این حساب با گوگل ساخته شده است. با گوگل وارد شو.",
          },
        },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { ok: false, error: { message: "ایمیل یا رمز عبور اشتباه است." } },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, email: user.email });
    const cookie = createAuthCookie(token);

    const cookieStore = await cookies();
    cookieStore.set(cookie);

    return NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}
