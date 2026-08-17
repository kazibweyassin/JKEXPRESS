import { PrismaClient } from "@prisma/client";

const SQLITE_FALLBACK = "file:./dev.db";

function resolveDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  process.env.DATABASE_URL = SQLITE_FALLBACK;
  return SQLITE_FALLBACK;
}

const databaseUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
