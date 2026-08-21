import { PrismaClient } from "@prisma/client";

const POSTGRES_FALLBACK =
  "postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public";

function resolveDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  process.env.DATABASE_URL = POSTGRES_FALLBACK;
  return POSTGRES_FALLBACK;
}

const databaseUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    // Prisma's own console.error of connection failures is treated as a
    // Next.js overlay ("Console PrismaClientInitializationError").
    log: [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
