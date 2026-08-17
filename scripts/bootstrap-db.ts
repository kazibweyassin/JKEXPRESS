/**
 * Apply Prisma migrations, then seed once if the database is empty.
 * Used on Render/production start.
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const POSTGRES_FALLBACK =
  "postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public";

function resolveDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  process.env.DATABASE_URL = POSTGRES_FALLBACK;
  return POSTGRES_FALLBACK;
}

async function main() {
  const url = resolveDatabaseUrl();

  if (/^file:/i.test(url)) {
    console.error(
      "[bootstrap-db] DATABASE_URL is a SQLite file, but Prisma is configured for PostgreSQL.",
    );
    console.error(
      "[bootstrap-db] Set DATABASE_URL to a Postgres connection string (Render Postgres or docker compose).",
    );
    return;
  }

  try {
    console.log("[bootstrap-db] Applying Prisma migrations...");
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: process.env,
    });
  } catch (error) {
    console.error("[bootstrap-db] prisma migrate deploy failed", error);
    return;
  }

  const db = new PrismaClient();
  try {
    const users = await db.user.count();
    if (users > 0) {
      console.log("[bootstrap-db] Database already has data, skipping seed.");
      return;
    }
    console.log("[bootstrap-db] Empty database, running seed...");
    execSync("npx tsx prisma/seed.ts", {
      stdio: "inherit",
      env: process.env,
    });
  } catch (error) {
    console.error("[bootstrap-db] Seed skipped", error);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error("[bootstrap-db] Failed", error);
});
