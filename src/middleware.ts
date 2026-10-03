import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { usesSecureAuthCookie } from "@/lib/auth-cookie";

const protectedPrefixes = ["/dashboard", "/portal"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/login") {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }
  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Production sets __Secure-authjs.session-token. getToken() otherwise
  // looks for authjs.session-token and treats a valid login as signed out.
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: usesSecureAuthCookie({
      authUrl: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL,
      forwardedProto: req.headers.get("x-forwarded-proto"),
      protocol: req.nextUrl.protocol,
    }),
  });

  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const roleSlug = (token.role as { slug?: string } | undefined)?.slug;

  if (pathname.startsWith("/portal/tenant") && roleSlug !== "tenant" && roleSlug !== "super-administrator") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname.startsWith("/portal/owner") && roleSlug !== "property-owner" && roleSlug !== "super-administrator") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*"],
};
