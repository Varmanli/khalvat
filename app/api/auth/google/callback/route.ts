import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, authAccounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { signToken, createAuthCookie } from "@/lib/auth";

const STATE_COOKIE = "khalvat_oauth_state";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const FAIL_REDIRECT = `${APP_URL}/login?error=google_failed`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();

  // Clear state cookie regardless of outcome
  const storedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.set(STATE_COOKIE, "", { maxAge: 0, path: "/" });

  // User cancelled or Google error
  if (error || !code) {
    return NextResponse.redirect(FAIL_REDIRECT);
  }

  // CSRF state validation
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(FAIL_REDIRECT);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      }),
    });

    if (!tokenRes.ok) return NextResponse.redirect(FAIL_REDIRECT);
    const tokenData = await tokenRes.json();

    // Fetch user profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    if (!profileRes.ok) return NextResponse.redirect(FAIL_REDIRECT);
    const profile: {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    } = await profileRes.json();

    if (!profile.email || !profile.sub) {
      return NextResponse.redirect(FAIL_REDIRECT);
    }

    const normalizedEmail = profile.email.toLowerCase().trim();

    // Find existing OAuth account
    const existingAccount = await db
      .select({ userId: authAccounts.userId })
      .from(authAccounts)
      .where(
        and(
          eq(authAccounts.provider, "google"),
          eq(authAccounts.providerAccountId, profile.sub)
        )
      )
      .limit(1);

    let userId: string;

    if (existingAccount[0]) {
      // Known Google account → just log in
      userId = existingAccount[0].userId;
    } else {
      // Look up by email
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existingUser[0]) {
        // Existing credentials user → link Google account
        userId = existingUser[0].id;
        await db.insert(authAccounts).values({
          userId,
          provider: "google",
          providerAccountId: profile.sub,
        });
      } else {
        // Brand new user — create with no password
        const inserted = await db
          .insert(users)
          .values({
            name: profile.name ?? normalizedEmail.split("@")[0],
            email: normalizedEmail,
            passwordHash: null,
            image: profile.picture ?? null,
          })
          .returning({ id: users.id });

        userId = inserted[0].id;

        await db.insert(authAccounts).values({
          userId,
          provider: "google",
          providerAccountId: profile.sub,
        });
      }
    }

    // Issue JWT and set auth cookie
    const token = signToken({ userId, email: normalizedEmail });
    const cookie = createAuthCookie(token);
    cookieStore.set(cookie);

    return NextResponse.redirect(`${APP_URL}/dashboard`);
  } catch {
    return NextResponse.redirect(FAIL_REDIRECT);
  }
}
