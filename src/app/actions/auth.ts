"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { portalHomeForRole } from "@/lib/auth-guard";
import { getLoginRateLimitKey, getLoginRateLimitStatus } from "@/lib/auth-rate-limit";
import { db } from "@/lib/db";

export type LoginResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

export async function loginAction(
  _prev: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "");

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const rateLimitKey = getLoginRateLimitKey(email);
  const rateLimitStatus = getLoginRateLimitStatus(rateLimitKey);
  if (rateLimitStatus.blocked) {
    return {
      success: false,
      error: `Too many failed sign-in attempts. Please try again in ${rateLimitStatus.retryAfterSeconds} seconds.`,
    };
  }

  const user = await db.user.findFirst({
    where: { email, deletedAt: null, isActive: true },
    include: { role: true },
  });

  const home = user
    ? callbackUrl && callbackUrl.startsWith("/")
      ? callbackUrl
      : portalHomeForRole(user.role.slug)
    : "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: home,
    });
    return { success: true, redirectTo: home };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password." };
    }
    // Successful sign-in throws a NEXT_REDIRECT error — rethrow it
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
