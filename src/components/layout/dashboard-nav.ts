import {
  LayoutDashboard,
  Users,
  Building2,
  Home,
  KeyRound,
  FileText,
  Wallet,
  CreditCard,
  Wrench,
  ClipboardCheck,
  HardHat,
  ShoppingCart,
  Package,
  Truck,
  Handshake,
  UserCog,
  FolderOpen,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  resource: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const dashboardNavGroups: NavGroup[] = [
  {
    id: "overview",
    label: "",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, resource: "dashboard" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { href: "/dashboard/leads", label: "Leads", icon: Users, resource: "leads" },
      { href: "/dashboard/clients", label: "Clients", icon: Handshake, resource: "clients" },
      { href: "/dashboard/properties", label: "Properties", icon: Building2, resource: "properties" },
    ],
  },
  {
    id: "operations",
    label: "Property ops",
    items: [
      { href: "/dashboard/units", label: "Units", icon: Home, resource: "units" },
      { href: "/dashboard/tenants", label: "Tenants", icon: KeyRound, resource: "tenants" },
      { href: "/dashboard/leases", label: "Leases", icon: FileText, resource: "leases" },
      { href: "/dashboard/rent", label: "Rent invoices", icon: Wallet, resource: "rent" },
      { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench, resource: "maintenance" },
      { href: "/dashboard/inspections", label: "Inspections", icon: ClipboardCheck, resource: "inspections" },
    ],
  },
  {
    id: "construction",
    label: "Construction",
    items: [
      { href: "/dashboard/projects", label: "Projects", icon: HardHat, resource: "projects" },
      { href: "/dashboard/procurement", label: "Procurement", icon: ShoppingCart, resource: "procurement" },
      { href: "/dashboard/inventory", label: "Inventory", icon: Package, resource: "inventory" },
      { href: "/dashboard/equipment", label: "Equipment", icon: Truck, resource: "equipment" },
      { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck, resource: "suppliers" },
      { href: "/dashboard/contractors", label: "Contractors", icon: HardHat, resource: "contractors" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { href: "/dashboard/payments", label: "Payments", icon: CreditCard, resource: "payments" },
      { href: "/dashboard/employees", label: "Employees", icon: UserCog, resource: "employees" },
      { href: "/dashboard/documents", label: "Documents", icon: FolderOpen, resource: "documents" },
      { href: "/dashboard/reports", label: "Reports", icon: BarChart3, resource: "reports" },
      { href: "/dashboard/settings", label: "Settings", icon: Settings, resource: "settings" },
    ],
  },
];

export const dashboardNav: NavItem[] = dashboardNavGroups.flatMap((group) => group.items);
