import type { NextConfig } from "next";
import path from "path";

const r2PublicPattern = process.env.R2_PUBLIC_URL?.trim()
  ? new URL(`${process.env.R2_PUBLIC_URL.trim().replace(/\/$/, "")}/**`)
  : null;

// Prisma requires a nonempty URL at client init. Build hosts may leave
// DATABASE_URL empty; use the local Postgres default so `prisma generate` works.
if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public";
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "41mb",
    },
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      ...(r2PublicPattern ? [r2PublicPattern] : []),
    ],
  },
};

export default nextConfig;
