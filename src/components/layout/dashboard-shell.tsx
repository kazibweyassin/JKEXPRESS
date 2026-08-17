"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  X,
  Plus,
} from "lucide-react";
import { dashboardNavGroups } from "@/components/layout/dashboard-nav";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate, initials } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";

export type ShellNotification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type Props = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    roleName: string;
    permissions: string[];
  };
  companyName?: string;
  notificationCount?: number;
  notifications?: ShellNotification[];
};

const quickCreate = [
  { href: "/dashboard/leads", label: "New lead", resource: "leads" },
  { href: "/dashboard/properties/new", label: "New property", resource: "properties" },
  { href: "/dashboard/maintenance", label: "Maintenance ticket", resource: "maintenance" },
] as const;

export function DashboardShell({
  children,
  user,
  companyName = "JK Express",
  notificationCount = 0,
  notifications = [],
}: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const closeMenus = () => {
    setProfileOpen(false);
    setCreateOpen(false);
    setNotifOpen(false);
  };

  const navGroups = dashboardNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(user.permissions, item.resource, "view"),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const createItems = quickCreate.filter(
    (item) =>
      hasPermission(user.permissions, item.resource, "create") ||
      hasPermission(user.permissions, item.resource, "view"),
  );

  const navList = (onNavigate?: () => void) =>
    navGroups.map((group) => (
      <div key={group.id} className="mb-4">
        {group.label ? (
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {group.label}
          </p>
        ) : null}
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-white/10 font-medium text-white ring-1 ring-accent-500/40"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    ));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-navy-950 text-white lg:flex">
        <div className="border-b border-white/10 bg-white px-3 py-3">
          <Link href="/dashboard" className="block" aria-label={companyName}>
            <Logo height={36} variant="compact" />
          </Link>
        </div>
        <div className="brand-red-bar h-0.5 w-full" />
        <nav className="flex-1 overflow-y-auto p-3">{navList()}</nav>
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-950 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-white px-3 py-3">
              <Logo height={32} variant="compact" />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded p-1 text-navy-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="brand-red-bar h-0.5 w-full" />
            <nav className="flex-1 overflow-y-auto p-3">
              {navList(() => setSidebarOpen(false))}
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-slate-600 hover:bg-navy-50 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <form
            action="/dashboard/search"
            method="get"
            className="relative hidden max-w-md flex-1 md:block"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              placeholder="Search leads, properties, tenants..."
              className="h-9 pl-9"
            />
          </form>
          <Link
            href="/dashboard/search"
            className="rounded-md p-2 text-slate-600 hover:bg-navy-50 md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {createItems.length > 0 ? (
              <div className="relative hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setCreateOpen((v) => !v);
                    setProfileOpen(false);
                    setNotifOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Quick create
                </Button>
                {createOpen ? (
                  <div className="absolute right-0 mt-1 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {createItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-3 py-2 text-sm hover:bg-navy-50"
                        onClick={() => setCreateOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="relative">
              <button
                type="button"
                className="relative rounded-md p-2 text-slate-600 hover:bg-navy-50"
                aria-label="Notifications"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                  setCreateOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 ? (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                ) : null}
              </button>
              {notifOpen ? (
                <div className="absolute right-0 mt-1 w-80 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                    <p className="text-sm font-semibold text-navy-900">Notifications</p>
                    {notificationCount > 0 ? (
                      <form action={markAllNotificationsRead}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-navy-700 hover:underline"
                        >
                          Mark all read
                        </button>
                      </form>
                    ) : null}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-slate-500">
                      No notifications yet
                    </p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {notifications.map((item) => (
                        <li key={item.id}>
                          <form action={markNotificationRead}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className={cn(
                                "w-full px-3 py-2.5 text-left hover:bg-navy-50",
                                !item.isRead && "bg-navy-50/60",
                              )}
                            >
                              <p className="text-sm font-medium text-slate-900">
                                {item.title}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                {item.message}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {formatDate(item.createdAt)}
                              </p>
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/dashboard/notifications"
                    className="block border-t border-slate-100 px-3 py-2 text-center text-xs font-medium text-navy-800 hover:bg-navy-50"
                    onClick={() => setNotifOpen(false)}
                  >
                    View all
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setCreateOpen(false);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-navy-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                  {initials(user.name)}
                </span>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500">{user.roleName}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>
              {profileOpen ? (
                <div className="absolute right-0 mt-1 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="block px-3 py-2 text-sm hover:bg-navy-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8" onClick={closeMenus}>
          {children}
        </main>
      </div>
    </div>
  );
}
