import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { z } from "zod";
export function apiError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: { message } }, { status });
}
export async function plannerApi(
  action: (userId: string) => Promise<Response>,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("برای ادامه باید وارد حساب شوید.", 401);
    return await action(user.userId);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError)
      return apiError("اطلاعات واردشده معتبر نیست.", 400);
    console.error(
      "Planner request failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return apiError("ذخیره نشد. دوباره تلاش کنید.", 500);
  }
}
