import type { NextConfig } from "next";
import path from "path";

// Prisma requires a nonempty URL at client init. Hosts like Vercel may
// leave DATABASE_URL unset/empty during build; use the local SQLite default.
if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = "file:./dev.db";
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
