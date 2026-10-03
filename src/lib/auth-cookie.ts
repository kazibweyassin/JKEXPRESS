/**
 * Auth.js names the session cookie from the auth URL protocol:
 * `authjs.session-token` on HTTP, `__Secure-authjs.session-token` on HTTPS.
 * `getToken()` does not follow that rule unless `secureCookie` is passed.
 */
export function usesSecureAuthCookie(input: {
  authUrl?: string | null;
  forwardedProto?: string | null;
  protocol?: string | null;
}) {
  const authUrl = input.authUrl?.trim();
  if (authUrl) return authUrl.startsWith("https://");

  const forwarded = input.forwardedProto?.split(",")[0]?.trim();
  if (forwarded) return forwarded === "https";

  return input.protocol === "https:" || input.protocol === "https";
}
