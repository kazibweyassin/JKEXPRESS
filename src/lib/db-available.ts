/**
 * Public pages must keep working when Postgres is unreachable
 * (currently DATABASE_URL points at db.prisma.io). Probe at most once
 * per process; skip known-offline Prisma hosts unless USE_DB_LISTINGS=true.
 */

let available: boolean | null = null;
let inflight: Promise<boolean> | null = null;

export function shouldSkipDatabase(
  _url = process.env.DATABASE_URL,
  forceListings = process.env.USE_DB_LISTINGS,
): boolean {
  return forceListings !== "true";
}

export function markDatabaseUnavailable() {
  available = false;
}

export async function isDatabaseAvailable(): Promise<boolean> {
  if (available !== null) return available;
  if (shouldSkipDatabase()) {
    available = false;
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
      available = false;
    } finally {
      inflight = null;
    }
    return available === true;
  })();

  return inflight;
}
