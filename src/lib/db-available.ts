/**
 * Public pages must keep working when the configured host is known-offline
 * (Prisma Data Platform). Local Postgres is probed, and a failed probe is
 * retried so the dashboard banner can clear once the database is back.
 */

let available: boolean | null = null;
let checkedAt = 0;
let inflight: Promise<boolean> | null = null;
const RETRY_AFTER_MS = 5_000;

function hostnameOf(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function shouldSkipDatabase(
  url = process.env.DATABASE_URL,
  forceListings = process.env.USE_DB_LISTINGS,
): boolean {
  if (forceListings === "true") return false;
  return hostnameOf(url) === "db.prisma.io";
}

export function markDatabaseUnavailable() {
  available = false;
  checkedAt = Date.now();
}

export async function isDatabaseAvailable(): Promise<boolean> {
  if (shouldSkipDatabase()) {
    available = false;
    return false;
  }
  if (available === true) return true;
  if (available === false && Date.now() - checkedAt < RETRY_AFTER_MS) {
    return false;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const { db } = await import("./db");
      await Promise.race([
        db.$queryRaw`SELECT 1`,
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("database timeout")), 800);
        }),
      ]);
      available = true;
    } catch {
      markDatabaseUnavailable();
    } finally {
      inflight = null;
    }
    return available === true;
  })();

  return inflight;
}
