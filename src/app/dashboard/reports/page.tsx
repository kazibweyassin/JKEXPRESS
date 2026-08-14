import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  HardHat,
  Percent,
  Wallet,
  AlertTriangle,
  Wrench,
} from "lucide-react";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  await requirePagePermission("reports");

  const now = new Date();
  const expiringLeaseWindow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [
    occupied,
    vacant,
    arrears,
    rentCollected,
    openMaintenance,
    activeProjects,
    avgProgress,
    expiringLeases,
  ] = await Promise.all([
    db.unit.count({ where: { status: "OCCUPIED", deletedAt: null } }),
    db.unit.count({ where: { status: "VACANT", deletedAt: null } }),
    db.invoice.aggregate({
      _sum: { balance: true },
      where: { status: { in: ["PENDING", "PARTIAL", "OVERDUE"] }, deletedAt: null },
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED", deletedAt: null },
    }),
    db.maintenanceTicket.count({
      where: { status: { notIn: ["CLOSED", "CANCELLED", "COMPLETED"] }, deletedAt: null },
    }),
    db.constructionProject.count({ where: { status: "ACTIVE", deletedAt: null } }),
    db.constructionProject.aggregate({
      _avg: { completionPercentage: true },
      where: { status: "ACTIVE", deletedAt: null },
    }),
    db.lease.count({
      where: {
        status: { in: ["ACTIVE", "EXPIRING"] },
        endDate: {
          lte: expiringLeaseWindow,
          gte: now,
        },
        deletedAt: null,
      },
    }),
  ]);

  const totalUnits = occupied + vacant;
  const occupancy = totalUnits ? Math.round((occupied / totalUnits) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Operational snapshots. CSV export and print layouts can be extended per report."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Occupancy rate" value={`${occupancy}%`} icon={Percent} subtitle={`${occupied} occupied / ${vacant} vacant`} />
        <StatCard title="Rent arrears" value={formatCurrency(Number(arrears._sum.balance ?? 0))} icon={AlertTriangle} />
        <StatCard title="Rent collected" value={formatCurrency(Number(rentCollected._sum.amount ?? 0))} icon={Wallet} />
        <StatCard title="Active projects" value={activeProjects} icon={HardHat} subtitle={`Avg progress ${Math.round(avgProgress._avg.completionPercentage ?? 0)}%`} />
        <StatCard title="Open maintenance" value={openMaintenance} icon={Wrench} />
        <StatCard title="Expiring leases (90d)" value={expiringLeases} icon={Building2} />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Available report modules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          {[
            "Property occupancy",
            "Rent collection & arrears",
            "Expiring leases",
            "Owner statements",
            "Project budget vs actual",
            "Procurement expenditure",
            "Inventory movement",
            "Maintenance costs",
            "Sales pipeline",
            "Agent performance",
          ].map((name) => (
            <div
              key={name}
              className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
            >
              {name}
              <span className="ml-2 text-xs text-slate-400">filter + CSV planned</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
