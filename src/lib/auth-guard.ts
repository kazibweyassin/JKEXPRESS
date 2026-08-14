import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission, type PermissionInput } from "@/lib/permissions";

type SessionLike = {
  user?: {
    permissions?: PermissionInput;
  } | null;
} | null | undefined;

export function hasSessionPermission(session: SessionLike, resource: string, action = "view") {
  return hasPermission(session?.user?.permissions, resource, action);
}

export async function requireSession(callbackUrl = "/dashboard") {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

export async function requirePagePermission(
  resource: string,
  action = "view",
) {
  const session = await requireSession();
  if (!hasSessionPermission(session, resource, action)) {
    redirect("/dashboard?error=forbidden");
  }
  return session;
}

export function portalHomeForRole(slug: string) {
  switch (slug) {
    case "tenant":
      return "/portal/tenant";
    case "property-owner":
      return "/portal/owner";
    case "buyer":
      return "/portal/buyer";
    default:
      return "/dashboard";
  }
}
