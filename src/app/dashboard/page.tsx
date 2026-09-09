import Link from "next/link";
import {
  Building2,
  HardHat,
  Wallet,
  Wrench,
  FileWarning,
  Users,
  Percent,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { isDatabaseAvailable } from "@/lib/db-available";
import { safeQuery } from "@/lib/safe-query";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Dashboard" };

function fetchDashboardData(now: Date, in90: Date) {
  return Promise.all([
    safeQuery(() => db.constructionProject.count({ where: { status: "ACTIVE", deletedAt: null } }), 0),
    safeQuery(() => db.constructionProject.count({ where: { status: "COMPLETED", deletedAt: null } }), 0),
    safeQuery(() => db.property.count({ where: { deletedAt: null } }), 0),
    safeQuery(() => db.property.count({ where: { status: "AVAILABLE", deletedAt: null } }), 0),
    safeQuery(() => db.unit.count({ where: { status: "OCCUPIED", deletedAt: null } }), 0),
    safeQuery(() => db.unit.count({ where: { status: "VACANT", deletedAt: null } }), 0),
    safeQuery(() => db.invoice.aggregate({ _sum: { totalAmount: true }, where: { type: "RENT", deletedAt: null } }), { _sum: { totalAmount: null } }),
    safeQuery(() => db.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED", deletedAt: null } }), { _sum: { amount: null } }),
    safeQuery(() => db.invoice.aggregate({
      _sum: { balance: true },
      where: { deletedAt: null, status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
    }), { _sum: { balance: null } }),
    safeQuery(() => db.maintenanceTicket.count({
      where: { status: { notIn: ["CLOSED", "CANCELLED", "COMPLETED"] }, deletedAt: null },
    }), 0),
    safeQuery(() => db.lease.findMany({
      where: { status: { in: ["ACTIVE", "EXPIRING"] }, endDate: { lte: in90, gte: now }, deletedAt: null },
      include: { tenant: true, unit: true, property: true },
      take: 5,
      orderBy: { endDate: "asc" },
    }), []),
    safeQuery(() => db.purchaseRequest.count({ where: { status: { in: ["SUBMITTED", "PENDING_APPROVAL", "PM_REVIEW"] } } }), 0),
    safeQuery(() => db.lead.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5 }), []),
    safeQuery(() => db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true } }), []),
  ]);
}

type DashboardData = Awaited<ReturnType<typeof fetchDashboardData>>;

const EMPTY_DASHBOARD_DATA = [
  0, 0, 0, 0, 0, 0,
  { _sum: { totalAmount: null } },
  { _sum: { amount: null } },
  { _sum: { balance: null } },
  0, [], 0, [], [],
] as unknown as DashboardData;

export default async function DashboardPage() {
  await requirePagePermission("dashboard");

  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  let databaseOffline = false;
  let dashboardData: DashboardData;
  try {
    dashboardData = await fetchDashboardData(now, in90);
    databaseOffline = !(await isDatabaseAvailable());
  } catch {
    databaseOffline = true;
    dashboardData = EMPTY_DASHBOARD_DATA;
  }

  const [
    activeProjects,
    completedProjects,
    totalProperties,
    availableProperties,
    occupiedUnits,
    vacantUnits,
    rentInvoiced,
    rentCollected,
    outstandingRent,
    openMaintenance,
    expiringLeases,
    pendingApprovals,
    recentLeads,
    recentActivities,
  ] = dashboardData;

  const totalUnits = occupiedUnits + vacantUnits;
  const occupancyRate =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Executive overview"
        description={databaseOffline ? "Dashboard is available, but live database metrics are temporarily offline." : "Live metrics from construction, real estate and property operations."}
      />

      {databaseOffline ? (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          <FileWarning className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-semibold">Database connection unavailable</p><p className="mt-1 text-amber-800">Live totals and recent records are showing as empty. They will return automatically when Postgres is reachable again.</p></div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Occupancy rate"
          value={`${occupancyRate}%`}
          icon={Percent}
          subtitle={`${occupiedUnits} occupied · ${vacantUnits} vacant`}
          tone={occupancyRate >= 80 ? "success" : occupancyRate < 60 ? "warning" : "default"}
          progress={occupancyRate}
        />
        <StatCard
          title="Outstanding rent"
          value={formatCurrency(Number(outstandingRent._sum.balance ?? 0))}
          icon={Wallet}
          subtitle={`Collected ${formatCurrency(Number(rentCollected._sum.amount ?? 0))}`}
          tone={Number(outstandingRent._sum.balance ?? 0) > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Open maintenance"
          value={openMaintenance}
          icon={Wrench}
          tone={openMaintenance > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Expiring leases (90d)"
          value={expiringLeases.length}
          icon={FileWarning}
          tone={expiringLeases.length > 0 ? "warning" : "default"}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active projects" value={activeProjects} icon={HardHat} subtitle={`${completedProjects} completed`} />
        <StatCard title="Properties" value={totalProperties} icon={Building2} subtitle={`${availableProperties} available`} />
        <StatCard title="Rent invoiced" value={formatCurrency(Number(rentInvoiced._sum.totalAmount ?? 0))} icon={Wallet} />
        <StatCard title="Pending approvals" value={pendingApprovals} icon={Users} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent leads</CardTitle>
            <Link href="/dashboard/leads" className="text-sm text-navy-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{lead.reference}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(lead.stage)}>
                        {statusLabel(lead.stage)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{statusLabel(lead.source)}</TableCell>
                  </TableRow>
                ))}
                {recentLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-500">
                      No leads yet
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expiring leases</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Ends</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringLeases.map((lease) => (
                  <TableRow key={lease.id}>
                    <TableCell>
                      {lease.tenant.firstName} {lease.tenant.lastName}
                    </TableCell>
                    <TableCell className="text-xs">
                      {lease.property.title} · {lease.unit.unitNumber}
                    </TableCell>
                    <TableCell>{formatDate(lease.endDate)}</TableCell>
                  </TableRow>
                ))}
                {expiringLeases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-500">
                      No leases expiring soon
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-100">
            {recentActivities.map((log) => (
              <li key={log.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                <div>
                  <span className="font-medium text-slate-900">
                    {log.user?.name ?? "System"}
                  </span>{" "}
                  <span className="text-slate-600">
                    {log.action.toLowerCase()} {log.entityType}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDate(log.createdAt)}
                </span>
              </li>
            ))}
            {recentActivities.length === 0 ? (
              <li className="py-6 text-center text-slate-500">No activity logged yet</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
