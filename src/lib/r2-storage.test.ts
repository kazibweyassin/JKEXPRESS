import { describe, expect, it } from "vitest";

import { normalizeR2PublicUrl } from "./r2-storage";

describe("normalizeR2PublicUrl", () => {
  it("rewrites the Cloudflare API endpoint to the public bucket hostname", () => {
    expect(
      normalizeR2PublicUrl("https://account123.r2.cloudflarestorage.com/jkexpress", "jkexpress", "account123"),
    ).toBe("https://jkexpress.account123.r2.cloudflarestorage.com");

    expect(
      normalizeR2PublicUrl("https://account123.r2.cloudflarestorage.com", "jkexpress", "account123"),
    ).toBe("https://jkexpress.account123.r2.cloudflarestorage.com");
  });

  it("leaves custom public domains unchanged", () => {
    expect(normalizeR2PublicUrl("https://cdn.example.com", "jkexpress", "account123")).toBe(
      "https://cdn.example.com",
    );
  });
});
