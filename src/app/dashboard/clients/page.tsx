import { Handshake } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
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
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  await requirePagePermission("clients");

  const contacts = await db.contact.findMany({
    where: {
      deletedAt: null,
      type: { in: ["CLIENT", "BUYER"] },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Client and buyer contacts from CRM."
      />

      {contacts.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No clients yet"
          description="Contacts marked as client or buyer will show here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.firstName} {c.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(c.type)}>{statusLabel(c.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{c.email ?? "—"}</TableCell>
                    <TableCell className="text-xs">{c.phone ?? "—"}</TableCell>
                    <TableCell className="text-xs">{c.company ?? "—"}</TableCell>
                    <TableCell className="text-xs">{c.city ?? "—"}</TableCell>
                    <TableCell className="text-xs">{formatDate(c.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
