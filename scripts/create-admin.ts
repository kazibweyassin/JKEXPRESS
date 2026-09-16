import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

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
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!email || !password || !databaseUrl) {
    throw new Error(
      "ADMIN_EMAIL, ADMIN_PASSWORD, and DATABASE_URL are required.",
    );
  }

  if (password.length < 8) {
    throw new Error(
      "The administrator password must contain at least 8 characters.",
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const roleResult = await client.query<{ id: string }>(
      `INSERT INTO "Role" (id, name, slug, description, "isSystem", "createdAt", "updatedAt")
       VALUES ($1, 'Administrator', 'admin', 'Full system administrator', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         "isSystem" = true,
         "updatedAt" = CURRENT_TIMESTAMP
       RETURNING id`,
      [randomUUID()],
    );
    const roleId = roleResult.rows[0].id;

    for (const resource of resources) {
      for (const action of actions) {
        const permissionResult = await client.query<{ id: string }>(
          `INSERT INTO "Permission" (id, resource, action, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (resource, action) DO UPDATE SET description = EXCLUDED.description
           RETURNING id`,
          [randomUUID(), resource, action, `${action} ${resource}`],
        );

        await client.query(
          `INSERT INTO "RolePermission" (id, "roleId", "permissionId")
           VALUES ($1, $2, $3)
           ON CONFLICT ("roleId", "permissionId") DO NOTHING`,
          [randomUUID(), roleId, permissionResult.rows[0].id],
        );
      }
    }

  const passwordHash = await bcrypt.hash(password, 12);

    await client.query(
      `INSERT INTO "User" (id, name, email, "passwordHash", "roleId", "isActive", "createdAt", "updatedAt")
       VALUES ($1, 'JK Express Admin', $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         "passwordHash" = EXCLUDED."passwordHash",
         "roleId" = EXCLUDED."roleId",
         "isActive" = true,
         "updatedAt" = CURRENT_TIMESTAMP,
         "deletedAt" = NULL`,
      [randomUUID(), email, passwordHash, roleId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  console.log("Administrator setup completed successfully.");
  console.log(`Email: ${email}`);
  console.log(`Resources configured: ${resources.length}`);
  console.log(`Permissions configured: ${resources.length * actions.length}`);
}

main()
  .catch((error) => {
    console.error("Unable to create administrator:");
    console.error(error);
    process.exitCode = 1;
  });