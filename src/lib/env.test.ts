import { afterEach, describe, expect, it } from "vitest";
import { getEnv } from "./env";

describe("getEnv", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("accepts a valid auth setup", () => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public",
      AUTH_SECRET: "1234567890123456",
      NEXTAUTH_SECRET: "",
    };

    const env = getEnv();

    expect(env.DATABASE_URL).toBe(
      "postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public",
    );
    expect(env.AUTH_SECRET).toBe("1234567890123456");
  });

  it("defaults DATABASE_URL when it is missing or empty", () => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: "",
      AUTH_SECRET: "1234567890123456",
    };

    expect(getEnv().DATABASE_URL).toBe(
      "postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public",
    );
  });

  it("throws when no auth secret is configured", () => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public",
      AUTH_SECRET: "",
      NEXTAUTH_SECRET: "",
    };

    expect(() => getEnv()).toThrow("AUTH_SECRET or NEXTAUTH_SECRET is required");
  });
});
