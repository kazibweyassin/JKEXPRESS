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
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency, statusLabel } from "@/lib/utils";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  await requirePagePermission("inventory");
  const items = await db.inventoryItem.findMany({
    where: { deletedAt: null },
    include: { warehouse: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Materials, tools and stock levels across warehouses."
      />
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
