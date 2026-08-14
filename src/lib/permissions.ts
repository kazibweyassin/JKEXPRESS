export const RESOURCES = [
  "dashboard",
  "leads",
  "clients",
  "properties",
  "units",
  "tenants",
  "leases",
  "rent",
  "payments",
  "maintenance",
  "inspections",
  "projects",
  "procurement",
  "inventory",
  "equipment",
  "suppliers",
  "contractors",
  "employees",
  "documents",
  "reports",
  "settings",
  "approvals",
  "owners",
] as const;

export const ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "export",
  "publish",
  "assign",
] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = (typeof ACTIONS)[number];

export const ROLE_SLUGS = {
  SUPER_ADMIN: "super-administrator",
  MANAGING_DIRECTOR: "managing-director",
  OPERATIONS_MANAGER: "operations-manager",
  PROJECT_MANAGER: "project-manager",
  SITE_ENGINEER: "site-engineer",
  QUANTITY_SURVEYOR: "quantity-surveyor",
  PROPERTY_MANAGER: "property-manager",
  SALES_MANAGER: "sales-manager",
  SALES_AGENT: "sales-agent",
  PROCUREMENT_OFFICER: "procurement-officer",
  STOREKEEPER: "storekeeper",
  ACCOUNTANT: "accountant",
  HR_OFFICER: "human-resource-officer",
  MAINTENANCE_OFFICER: "maintenance-officer",
  TECHNICIAN: "technician",
  RECEPTIONIST: "receptionist",
  PROPERTY_OWNER: "property-owner",
  TENANT: "tenant",
  BUYER: "buyer",
  SUPPLIER: "supplier",
  CONTRACTOR: "contractor",
} as const;

/** Full access for executive roles */
const ALL_PERMS: Array<{ resource: Resource; action: Action }> = RESOURCES.flatMap(
  (resource) => ACTIONS.map((action) => ({ resource, action })),
);

function perms(
  resources: Resource[],
  actions: Action[] = ["view", "create", "edit"],
): Array<{ resource: Resource; action: Action }> {
  return resources.flatMap((resource) =>
    actions.map((action) => ({ resource, action })),
  );
}

export const DEFAULT_ROLE_PERMISSIONS: Record<
  string,
  Array<{ resource: Resource; action: Action }>
> = {
  [ROLE_SLUGS.SUPER_ADMIN]: ALL_PERMS,
  [ROLE_SLUGS.MANAGING_DIRECTOR]: ALL_PERMS,
  [ROLE_SLUGS.OPERATIONS_MANAGER]: perms(
    [
      "dashboard",
      "leads",
      "clients",
      "properties",
      "units",
      "tenants",
      "leases",
      "rent",
      "payments",
      "maintenance",
      "inspections",
      "projects",
      "procurement",
      "inventory",
      "employees",
      "documents",
      "reports",
      "approvals",
    ],
    ["view", "create", "edit", "approve", "export", "assign"],
  ),
  [ROLE_SLUGS.PROJECT_MANAGER]: perms(
    ["dashboard", "projects", "procurement", "inventory", "documents", "reports"],
    ["view", "create", "edit", "approve", "assign"],
  ),
  [ROLE_SLUGS.SITE_ENGINEER]: perms(
    ["dashboard", "projects", "documents"],
    ["view", "create", "edit"],
  ),
  [ROLE_SLUGS.QUANTITY_SURVEYOR]: perms(
    ["dashboard", "projects", "procurement", "documents", "reports"],
    ["view", "create", "edit", "export"],
  ),
  [ROLE_SLUGS.PROPERTY_MANAGER]: perms(
    [
      "dashboard",
      "properties",
      "units",
      "tenants",
      "leases",
      "rent",
      "payments",
      "maintenance",
      "inspections",
      "documents",
      "reports",
      "owners",
    ],
    ["view", "create", "edit", "approve", "export", "assign"],
  ),
  [ROLE_SLUGS.SALES_MANAGER]: perms(
    ["dashboard", "leads", "clients", "properties", "reports"],
    ["view", "create", "edit", "assign", "export", "publish"],
  ),
  [ROLE_SLUGS.SALES_AGENT]: perms(
    ["dashboard", "leads", "clients", "properties"],
    ["view", "create", "edit"],
  ),
  [ROLE_SLUGS.PROCUREMENT_OFFICER]: perms(
    ["dashboard", "procurement", "suppliers", "inventory", "documents"],
    ["view", "create", "edit", "approve"],
  ),
  [ROLE_SLUGS.STOREKEEPER]: perms(
    ["dashboard", "inventory", "equipment", "procurement"],
    ["view", "create", "edit"],
  ),
  [ROLE_SLUGS.ACCOUNTANT]: perms(
    ["dashboard", "rent", "payments", "reports", "documents"],
    ["view", "create", "edit", "export", "approve"],
  ),
  [ROLE_SLUGS.HR_OFFICER]: perms(
    ["dashboard", "employees", "documents", "reports"],
    ["view", "create", "edit"],
  ),
  [ROLE_SLUGS.MAINTENANCE_OFFICER]: perms(
    ["dashboard", "maintenance", "inspections", "properties", "units"],
    ["view", "create", "edit", "assign"],
  ),
  [ROLE_SLUGS.TECHNICIAN]: perms(
    ["dashboard", "maintenance"],
    ["view", "edit"],
  ),
  [ROLE_SLUGS.RECEPTIONIST]: perms(
    ["dashboard", "leads", "clients"],
    ["view", "create", "edit"],
  ),
  [ROLE_SLUGS.PROPERTY_OWNER]: perms(["dashboard", "owners", "properties", "documents"], [
    "view",
  ]),
  [ROLE_SLUGS.TENANT]: perms(["dashboard", "leases", "rent", "payments", "maintenance"], [
    "view",
    "create",
  ]),
  [ROLE_SLUGS.BUYER]: perms(["dashboard", "properties"], ["view"]),
  [ROLE_SLUGS.SUPPLIER]: perms(["dashboard", "procurement"], ["view"]),
  [ROLE_SLUGS.CONTRACTOR]: perms(["dashboard", "projects"], ["view"]),
};

export type PermissionInput = ReadonlyArray<string> | Set<string> | null | undefined;

export function permissionKey(resource: string, action: string) {
  return `${resource}:${action}`;
}

function normalizePermissions(userPermissions: PermissionInput) {
  if (!userPermissions) {
    return new Set<string>();
  }

  if (userPermissions instanceof Set) {
    return new Set(userPermissions);
  }

  return new Set(userPermissions.filter(Boolean));
}

export function hasPermission(
  userPermissions: PermissionInput,
  resource: Resource | string,
  action: Action | string,
) {
  const permissions = normalizePermissions(userPermissions);

  if (permissions.has("*")) {
    return true;
  }

  const exactPermission = permissionKey(resource, action);
  const wildcardPermission = permissionKey(resource, "*");
  const dashboardViewPermission =
    resource === "dashboard" && action === "view" && permissions.has("dashboard:view");

  return (
    permissions.has(exactPermission) ||
    permissions.has(wildcardPermission) ||
    dashboardViewPermission
  );
}

export function hasAnyPermission(
  userPermissions: PermissionInput,
  requiredPermissions: Array<{ resource: Resource | string; action: Action | string }>,
) {
  return requiredPermissions.some(({ resource, action }) => hasPermission(userPermissions, resource, action));
}

export function isSuperAdmin(userPermissions: PermissionInput) {
  return normalizePermissions(userPermissions).has("*");
}
