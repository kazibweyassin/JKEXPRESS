import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
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
    constructionProjects,
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
    db.constructionProject.findMany({
      where: { deletedAt: null },
      include: {
        boqs: { include: { items: true } },
        expenses: true,
        variations: true,
        contracts: { include: { ipcs: true } },
        purchaseRequests: { include: { items: true } },
      },
      orderBy: { updatedAt: "desc" },
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
        <CardHeader><CardTitle className="text-base">Construction control report</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Progress</TableHead><TableHead>BOQ budget</TableHead><TableHead>Actual cost</TableHead><TableHead>Variations</TableHead><TableHead>Certified</TableHead><TableHead>Procurement</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{constructionProjects.map((project) => {
              const boqBudget = project.boqs.reduce((sum, boq) => sum + boq.items.reduce((itemSum, item) => itemSum + Number(item.estimatedTotal), 0), 0);
              const boqActual = project.boqs.reduce((sum, boq) => sum + boq.items.reduce((itemSum, item) => itemSum + Number(item.actualCost ?? 0), 0), 0);
              const expenses = project.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
              const variations = project.variations.filter((variation) => variation.status === "APPROVED").reduce((sum, variation) => sum + Number(variation.amount), 0);
              const certified = project.contracts.reduce((sum, contract) => sum + contract.ipcs.reduce((ipcSum, ipc) => ipcSum + Number(ipc.grossAmount), 0), 0);
              return <TableRow key={project.id}><TableCell><div className="font-medium">{project.name}</div><div className="text-xs text-slate-500">{project.code}</div></TableCell><TableCell>{Math.round(project.completionPercentage)}%</TableCell><TableCell>{formatCurrency(boqBudget || Number(project.approvedBudget ?? 0))}</TableCell><TableCell>{formatCurrency(boqActual + expenses)}</TableCell><TableCell>{formatCurrency(variations)}</TableCell><TableCell>{formatCurrency(certified)}</TableCell><TableCell>{project.purchaseRequests.length} requests</TableCell><TableCell><Badge variant={statusVariant(project.status)}>{project.status.replaceAll("_", " ")}</Badge></TableCell></TableRow>;
            })}</TableBody>
          </Table>
        </CardContent>
      </Card>
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
