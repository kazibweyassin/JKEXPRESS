import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: { id: string; name: string; slug: string };
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    role: { id: string; name: string; slug: string };
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: { id: string; name: string; slug: string };
    permissions: string[];
  }
}
