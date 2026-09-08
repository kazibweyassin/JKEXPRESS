import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueStockForm } from "@/components/forms/construction-forms";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency, statusLabel } from "@/lib/utils";

export const metadata = { title: "Stores & materials" };

export default async function InventoryPage() {
  await requirePagePermission("inventory");
  const [items, projects] = await Promise.all([
    db.inventoryItem.findMany({
      where: { deletedAt: null },
      include: { warehouse: true },
      orderBy: { name: "asc" },
    }),
    db.constructionProject.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Stores & materials"
        description="Company stores only. Issue stock to a construction project; subcontractor materials stay off this register."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Issue to site</CardTitle>
        </CardHeader>
        <CardContent>
          <IssueStockForm
            items={items.map((item) => ({
              id: item.id,
              label: `${item.sku} — ${item.name} (${Number(item.quantityOnHand)} ${item.unit})`,
            }))}
            projects={projects.map((p) => ({
              id: p.id,
              label: `${p.code} — ${p.name}`,
            }))}
          />
        </CardContent>
      </Card>
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>On hand</TableHead>
              <TableHead>Reorder</TableHead>
              <TableHead>Unit cost</TableHead>
              <TableHead>Warehouse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const low =
                Number(item.quantityOnHand) <= Number(item.reorderLevel);
              return (
                <TableRow key={item.id} className={low ? "bg-amber-50/50" : undefined}>
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{statusLabel(item.category)}</TableCell>
                  <TableCell>
                    {Number(item.quantityOnHand)} {item.unit}
                    {low ? (
                      <Badge variant="warning" className="ml-2">
                        Low
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{Number(item.reorderLevel)}</TableCell>
                  <TableCell>
                    {item.unitCost
                      ? formatCurrency(Number(item.unitCost), item.currency)
                      : "—"}
                  </TableCell>
                  <TableCell>{item.warehouse?.name ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
