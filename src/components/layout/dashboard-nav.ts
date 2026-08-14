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

export const dashboardNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, resource: "dashboard" },
  { href: "/dashboard/leads", label: "Leads", icon: Users, resource: "leads" },
  { href: "/dashboard/clients", label: "Clients", icon: Handshake, resource: "clients" },
  { href: "/dashboard/properties", label: "Properties", icon: Building2, resource: "properties" },
  { href: "/dashboard/units", label: "Units", icon: Home, resource: "units" },
  { href: "/dashboard/tenants", label: "Tenants", icon: KeyRound, resource: "tenants" },
  { href: "/dashboard/leases", label: "Leases", icon: FileText, resource: "leases" },
  { href: "/dashboard/rent", label: "Rent invoices", icon: Wallet, resource: "rent" },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard, resource: "payments" },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench, resource: "maintenance" },
  { href: "/dashboard/inspections", label: "Inspections", icon: ClipboardCheck, resource: "inspections" },
  { href: "/dashboard/projects", label: "Projects", icon: HardHat, resource: "projects" },
  { href: "/dashboard/procurement", label: "Procurement", icon: ShoppingCart, resource: "procurement" },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package, resource: "inventory" },
  { href: "/dashboard/equipment", label: "Equipment", icon: Truck, resource: "equipment" },
  { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck, resource: "suppliers" },
  { href: "/dashboard/contractors", label: "Contractors", icon: HardHat, resource: "contractors" },
  { href: "/dashboard/employees", label: "Employees", icon: UserCog, resource: "employees" },
  { href: "/dashboard/documents", label: "Documents", icon: FolderOpen, resource: "documents" },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, resource: "reports" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, resource: "settings" },
];
