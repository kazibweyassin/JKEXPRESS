import type { NextConfig } from "next";
import path from "path";

// Prisma requires a nonempty URL at client init. Build hosts may leave
// DATABASE_URL empty; use the local Postgres default so `prisma generate` works.
if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public";
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
    ],
  },
};

export default nextConfig;
