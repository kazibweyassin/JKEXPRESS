import { describe, expect, it } from "vitest";
import {
  getLoginRateLimitStatus,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "./auth-rate-limit";

describe("auth rate limiting", () => {
  it("blocks access after repeated failed attempts", () => {
    const identifier = "admin@example.com";

    for (let attempt = 0; attempt < 5; attempt += 1) {
      recordFailedLogin(identifier, attempt * 1000);
    }

    const status = getLoginRateLimitStatus(identifier, 5000);

    expect(status.blocked).toBe(true);
    expect(status.remainingAttempts).toBe(0);
    expect(status.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after successful authentication", () => {
    const identifier = "tenant@example.com";

    recordFailedLogin(identifier, 1000);
    recordSuccessfulLogin(identifier);

    const status = getLoginRateLimitStatus(identifier, 2000);

    expect(status.blocked).toBe(false);
    expect(status.remainingAttempts).toBe(5);
  });
});
