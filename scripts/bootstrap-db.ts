/**
 * Ensure the database schema exists, then seed once if empty.
 * Used on host start (Render) where the SQLite file is not in git.
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const SQLITE_FALLBACK = "file:./dev.db";

function resolveDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  process.env.DATABASE_URL = SQLITE_FALLBACK;
  return SQLITE_FALLBACK;
}

async function main() {
  const url = resolveDatabaseUrl();

  if (/^postgres(ql)?:\/\//i.test(url)) {
    console.warn(
      "[bootstrap-db] DATABASE_URL is PostgreSQL but prisma/schema.prisma uses sqlite.",
    );
    console.warn(
      "[bootstrap-db] Either switch the Prisma provider to postgresql, or point DATABASE_URL at a sqlite file.",
    );
  }

  try {
    console.log("[bootstrap-db] Applying schema...");
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      env: process.env,
    });
  } catch (error) {
    console.error("[bootstrap-db] prisma db push failed", error);
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
