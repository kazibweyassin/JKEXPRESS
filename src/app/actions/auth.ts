"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { portalHomeForRole } from "@/lib/auth-guard";
import {
  getLoginRateLimitKey,
  getLoginRateLimitStatus,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/auth-rate-limit";
import { db } from "@/lib/db";
import { shouldSkipDatabase } from "@/lib/db-available";
import { verifyOfflineUser } from "@/lib/offline-auth";

export type LoginResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

/**
 * Only allow same-origin, path-relative redirects.
 * Rejects protocol-relative ("//evil.com") and backslash variants
 * ("/\evil.com"), which browsers can treat as absolute URLs.
 */
function isSafeRedirect(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\");
}

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

  try {
    // IMPORTANT: redirect must be false. Without it, a successful signIn()
    // throws a NEXT_REDIRECT error internally and control never returns to
    // this function — meaning nothing after a successful call (rate-limit
    // reset, audit logging, etc.) can ever run. Handing the redirect back
    // to the caller as data lets us do that work AND lets the client
    // perform the redirect.
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (shouldSkipDatabase()) {
      const offline = verifyOfflineUser(email, password);
      recordSuccessfulLogin(rateLimitKey);
      const home =
        callbackUrl && isSafeRedirect(callbackUrl)
          ? callbackUrl
          : portalHomeForRole(offline?.role.slug ?? "super-administrator");
      return { success: true, redirectTo: home };
    }

    // Only look up the user (and compute where to send them) once
    // credentials are verified — no point querying speculatively for
    // attempts that are about to fail.
    const user = await db.user.findFirst({
      where: { email, deletedAt: null, isActive: true },
      include: { role: true },
    });

    if (!user) {
      // signIn succeeded but we can't find/verify the corresponding user
      // record (deleted/deactivated between authorize() and this query,
      // replica lag, etc). Don't leave a session behind for an account we
      // can't confirm.
      await signOut({ redirect: false });
      return {
        success: false,
        error: "Account is unavailable. Please contact support.",
      };
    }

    // Successful, verified login — clear any accumulated failed-attempt count.
    recordSuccessfulLogin(rateLimitKey);

    const home =
      callbackUrl && isSafeRedirect(callbackUrl)
        ? callbackUrl
        : portalHomeForRole(user.role.slug);

    return { success: true, redirectTo: home };
  } catch (error) {
    if (error instanceof AuthError) {
      // Log the failure so rate limiting actually does something.
      recordFailedLogin(rateLimitKey);

      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return {
            success: false,
            error: "Something went wrong. Please try again.",
          };
      }
    }

    // Fallback catch-all for structural code errors
    return {
      success: false,
      error: "An unexpected authentication error occurred.",
    };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}