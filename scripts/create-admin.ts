import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const resources = [
  "dashboard",
  "clients",
  "contractors",
  "documents",
  "employees",
  "equipment",
  "inspections",
  "inventory",
  "leads",
  "leases",
  "maintenance",
  "payments",
  "procurement",
  "projects",
  "properties",
  "rent",
  "reports",
  "settings",
  "suppliers",
  "tenants",
  "units",
];

const actions = [
  "view",
  "create",
  "update",
  "delete",
  "approve",
  "export",
  "manage",
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  if (password.length < 8) {
    throw new Error(
      "The administrator password must contain at least 8 characters.",
    );
  }

  // Create or update the administrator role.
  const adminRole = await prisma.role.upsert({
    where: {
      slug: "admin",
    },
    update: {
      name: "Administrator",
      description: "Full system administrator",
      isSystem: true,
    },
    create: {
      name: "Administrator",
      slug: "admin",
      description: "Full system administrator",
      isSystem: true,
    },
  });

  // Create every administrator permission and attach it to the role.
  for (const resource of resources) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: {
          resource_action: {
            resource,
            action,
          },
        },
        update: {
          description: `${action} ${resource}`,
        },
        create: {
          resource,
          action,
          description: `${action} ${resource}`,
        },
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Securely hash the administrator password.
  const passwordHash = await bcrypt.hash(password, 12);

  // Create the administrator or update the existing account.
  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name: "JK Express Admin",
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: "JK Express Admin",
      email,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log("Administrator setup completed successfully.");
  console.log(`Email: ${admin.email}`);
  console.log(`Resources configured: ${resources.length}`);
  console.log(`Permissions configured: ${resources.length * actions.length}`);
}

main()
  .catch((error) => {
    console.error("Unable to create administrator:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });