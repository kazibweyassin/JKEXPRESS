import { KeyRound } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Tenants" };

export default async function TenantsPage() {
  await requirePagePermission("tenants");

  const tenants = await db.tenant.findMany({
    where: { deletedAt: null },
    include: {
      leases: {
        where: { status: { in: ["ACTIVE", "EXPIRING"] }, deletedAt: null },
        include: {
          unit: { select: { unitNumber: true } },
          property: { select: { title: true } },
        },
        take: 1,
        orderBy: { startDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Tenant directory and active leases."
      />

      {tenants.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No tenants yet"
          description="Tenants linked to leases will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Active unit</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => {
                  const lease = t.leases[0];
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.firstName} {t.lastName}
                      </TableCell>
                      <TableCell className="text-xs">{t.email ?? "—"}</TableCell>
                      <TableCell className="text-xs">{t.phone ?? "—"}</TableCell>
                      <TableCell className="text-xs">
                        {lease
                          ? `${lease.property.title} · ${lease.unit.unitNumber}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
