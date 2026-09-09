/**
 * Staff sign-in when Postgres is skipped (db.prisma.io unreachable).
 * Same emails/password as prisma/seed.ts.
 */

export const OFFLINE_PASSWORD = "Password123!";

export type OfflineUser = {
  id: string;
  email: string;
  name: string;
  role: { id: string; name: string; slug: string };
  permissions: string[];
};

export const OFFLINE_USERS: OfflineUser[] = [
  {
    id: "offline-admin",
    email: "admin@jkexpress.ug",
    name: "System Admin",
    role: {
      id: "offline-role-super-admin",
      name: "Super Administrator",
      slug: "super-administrator",
    },
    permissions: ["*"],
  },
  {
    id: "offline-md",
    email: "md@jkexpress.ug",
    name: "Grace Nakato",
    role: {
      id: "offline-role-md",
      name: "Managing Director",
      slug: "managing-director",
    },
    permissions: ["*"],
  },
];

export function verifyOfflineUser(
  email: string,
  password: string,
): OfflineUser | null {
  const normalized = email.toLowerCase().trim();
  if (password !== OFFLINE_PASSWORD) return null;
  return OFFLINE_USERS.find((user) => user.email === normalized) ?? null;
}
