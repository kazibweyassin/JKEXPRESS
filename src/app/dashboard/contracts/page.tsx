import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ConstructionContractForm,
  IpcForm,
  AddSpecificationForm,
  MarkIpcPaidForm,
} from "@/components/forms/construction-forms";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Contracts & IPCs" };

export default async function ContractsPage() {
  await requirePagePermission("projects");

  const [contracts, projects, contractors] = await Promise.all([
    safeQuery(
      () =>
        db.constructionContract.findMany({
          include: {
            project: true,
            contractor: true,
            specifications: { orderBy: { sortOrder: "asc" } },
            ipcs: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { createdAt: "desc" },
        }),
      [],
    ),
    safeQuery(
      () =>
        db.constructionProject.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, code: true },
          orderBy: { name: "asc" },
        }),
      [],
    ),
    safeQuery(
      () =>
        db.contractor.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      [],
    ),
  ]);

  const projectOptions = projects.map((p) => ({
    id: p.id,
    label: `${p.code} — ${p.name}`,
  }));
  const contractorOptions = contractors.map((c) => ({ id: c.id, label: c.name }));
  const contractOptions = contracts.map((c) => ({
    id: c.id,
    label: `${c.contractNumber} — ${c.title}`,
    previousCertified: c.ipcs.reduce((sum, ipc) => sum + Number(ipc.amountDue), 0),
  }));

  return (
    <div>
      <PageHeader
        title="Contracts, specifications & IPCs"
        description="FIDIC-style construction contracts. Specifications live on the contract. Quantity surveyors certify Interim Payment Certificates against measured work."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New contract</CardTitle>
          </CardHeader>
          <CardContent className="overflow-visible">
            <ConstructionContractForm
              projects={projectOptions}
              contractors={contractorOptions}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certify IPC</CardTitle>
          </CardHeader>
          <CardContent>
            {contractOptions.length ? (
              <IpcForm contracts={contractOptions} />
            ) : (
              <p className="text-sm text-slate-500">Create a contract first.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-6">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                {contract.contractNumber} · {contract.title}
                <Badge variant={statusVariant(contract.status)}>
                  {statusLabel(contract.status)}
                </Badge>
                <Badge variant="secondary">{contract.formOfContract}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-slate-600">
                {contract.project.name} · {contract.type === "SUB" ? "Subcontract" : "Main"} ·{" "}
                {contract.contractor?.name ?? "Client contract"} ·{" "}
                {contract.contractSum
                  ? formatCurrency(Number(contract.contractSum), contract.currency)
                  : "Sum TBC"}
              </p>
              {contract.specifications.length ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Specifications
                  </p>
                  <ul className="space-y-1">
                    {contract.specifications.map((spec) => (
                      <li key={spec.id}>
                        <span className="font-mono text-xs">{spec.clause}</span>{" "}
                        {spec.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {contract.ipcs.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IPC</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Retention</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contract.ipcs.map((ipc) => (
                      <TableRow key={ipc.id}>
                        <TableCell className="font-mono text-xs">{ipc.ipcNumber}</TableCell>
                        <TableCell>{formatCurrency(Number(ipc.grossAmount))}</TableCell>
                        <TableCell>{formatCurrency(Number(ipc.retention))}</TableCell>
                        <TableCell>{formatCurrency(Number(ipc.amountDue))}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(ipc.status)}>
                            {statusLabel(ipc.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(ipc.createdAt)}</TableCell>
                        <TableCell>
                          {ipc.status === "CERTIFIED" ? <MarkIpcPaidForm ipcId={ipc.id} /> : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-slate-500">No IPCs certified yet.</p>
              )}
              <AddSpecificationForm contractId={contract.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
