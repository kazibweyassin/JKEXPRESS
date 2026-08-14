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
import { dashboardNav } from "@/components/layout/dashboard-nav";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, initials } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";

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
};

export function DashboardShell({
  children,
  user,
  companyName = "JK Express",
  notificationCount = 0,
}: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const items = dashboardNav.filter((item) =>
    hasPermission(user.permissions, item.resource, "view"),
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-navy-950 text-white lg:flex">
        <div className="border-b border-white/10 bg-white px-3 py-3">
          <Link href="/dashboard" className="block" aria-label={companyName}>
            <Logo height={36} variant="compact" />
          </Link>
        </div>
        <div className="brand-red-bar h-0.5 w-full" />
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-white/10 font-medium text-white ring-1 ring-gold-500/40"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar */}
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
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
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
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search leads, properties, tenants..."
              className="h-9 pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/dashboard/leads">
                <Plus className="h-4 w-4" />
                Quick create
              </Link>
            </Button>
            <button
              type="button"
              className="relative rounded-md p-2 text-slate-600 hover:bg-navy-50"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              ) : null}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-navy-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                  {initials(user.name)}
                </span>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user.name}
                  </p>
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
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gold-500 hover:bg-gold-100"
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
