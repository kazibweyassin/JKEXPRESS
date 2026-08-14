import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16).optional(),
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  USE_LOCAL_STORAGE: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_COMPANY_NAME: z.string().optional(),
});

export function getEnv() {
  const sanitizedEnv = Object.fromEntries(
    Object.entries(process.env).map(([key, value]) => [key, value?.trim() ? value : undefined]),
  );

  const parsed = envSchema.safeParse(sanitizedEnv);
  if (!parsed.success) {
    console.error("Invalid environment variables", parsed.error.flatten());
    throw new Error("Invalid environment variables");
  }
  const data = parsed.data;
  if (!data.AUTH_SECRET && !data.NEXTAUTH_SECRET) {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required");
  }
  return data;
}
