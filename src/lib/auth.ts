import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  isLoginRateLimited,
  recordFailedLogin,
  recordSuccessfulLogin,
  getLoginRateLimitKey,
} from "@/lib/auth-rate-limit";
import { permissionKey } from "@/lib/permissions";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const normalizedEmail = parsed.data.email.toLowerCase();
        const rateLimitKey = getLoginRateLimitKey(normalizedEmail);
        if (isLoginRateLimited(rateLimitKey)) {
          return null;
        }

        const user = await db.user.findFirst({
          where: {
            email: normalizedEmail,
            deletedAt: null,
          },
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        });

        if (!user || !user.isActive || !user.passwordHash) {
          recordFailedLogin(rateLimitKey);
          return null;
        }

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          recordFailedLogin(rateLimitKey);
          return null;
        }

        recordSuccessfulLogin(rateLimitKey);

        const permissions =
          user.role.slug === "super-administrator"
            ? ["*"]
            : user.role.permissions.map((rp) =>
                permissionKey(rp.permission.resource, rp.permission.action),
              );

        try {
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              entityType: "User",
              entityId: user.id,
            },
          });
        } catch {
          // non-blocking
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          image: user.image,
          role: {
            id: user.role.id,
            name: user.role.name,
            slug: user.role.slug,
          },
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as {
          id: string;
          name: string;
          slug: string;
        };
        session.user.permissions = (token.permissions as string[]) ?? [];
        session.user.name = token.name ?? session.user.name ?? "";
        session.user.email = token.email ?? session.user.email ?? "";
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requirePermission(resource: string, action: string) {
  const session = await requireAuth();
  const perms = new Set(session.user.permissions);
  if (!perms.has("*") && !perms.has(permissionKey(resource, action))) {
    throw new Error("Forbidden");
  }
  return session;
}
