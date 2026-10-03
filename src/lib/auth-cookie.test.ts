import { describe, expect, it } from "vitest";
import { usesSecureAuthCookie } from "./auth-cookie";

describe("usesSecureAuthCookie", () => {
  it("follows an https auth URL even when the incoming request looks like http", () => {
    expect(
      usesSecureAuthCookie({
        authUrl: "https://www.jkexpressdevelopers.com",
        forwardedProto: "http",
        protocol: "http:",
      }),
    ).toBe(true);
  });

  it("keeps local http auth on the insecure cookie name", () => {
    expect(
      usesSecureAuthCookie({
        authUrl: "http://localhost:3000",
        forwardedProto: "http",
        protocol: "http:",
      }),
    ).toBe(false);
  });

  it("uses the request protocol when no auth URL is configured", () => {
    expect(
      usesSecureAuthCookie({
        forwardedProto: "https",
        protocol: "http:",
      }),
    ).toBe(true);
    expect(
      usesSecureAuthCookie({
        protocol: "http:",
      }),
    ).toBe(false);
  });
});
