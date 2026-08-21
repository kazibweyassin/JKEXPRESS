import {
  isDatabaseAvailable,
  markDatabaseUnavailable,
} from "@/lib/db-available";

export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!(await isDatabaseAvailable())) return fallback;
  try {
    return await fn();
  } catch {
    markDatabaseUnavailable();
    return fallback;
  }
}
