import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validations";
import { signToken, createAuthCookie } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: "اطلاعات واردشده معتبر نیست." } },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { ok: false, error: { message: "این ایمیل قبلاً ثبت شده است." } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const inserted = await db
      .insert(users)
      .values({ name, email: normalizedEmail, passwordHash })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    const user = inserted[0];
    const token = signToken({ userId: user.id, email: user.email });
    const cookie = createAuthCookie(token);

    const cookieStore = await cookies();
    cookieStore.set(cookie);

    return NextResponse.json({ ok: true, data: { user } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/auth/register failed:", err);
    return NextResponse.json(
      { ok: false, error: { message: "خطایی رخ داد. دوباره تلاش کن." } },
      { status: 500 }
    );
  }
}
