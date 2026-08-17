import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession, hasSessionPermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency, statusLabel } from "@/lib/utils";

export const metadata = { title: "Search" };

export default async function DashboardSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireSession("/dashboard/search");
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const canLeads = hasSessionPermission(session, "leads");
  const canProperties = hasSessionPermission(session, "properties");
  const canTenants = hasSessionPermission(session, "tenants");

  const [leads, properties, tenants] = query
    ? await Promise.all([
        canLeads
          ? db.lead.findMany({
              where: {
                deletedAt: null,
                OR: [
                  { firstName: { contains: query } },
                  { lastName: { contains: query } },
                  { email: { contains: query } },
                  { phone: { contains: query } },
                  { reference: { contains: query } },
                ],
              },
              take: 8,
              orderBy: { createdAt: "desc" },
            })
          : [],
        canProperties
          ? db.property.findMany({
              where: {
                deletedAt: null,
                OR: [
                  { title: { contains: query } },
                  { reference: { contains: query } },
                  { address: { contains: query } },
                  { city: { contains: query } },
                ],
              },
              take: 8,
              orderBy: { updatedAt: "desc" },
            })
          : [],
        canTenants
          ? db.tenant.findMany({
              where: {
                deletedAt: null,
                OR: [
                  { firstName: { contains: query } },
                  { lastName: { contains: query } },
                  { email: { contains: query } },
                  { phone: { contains: query } },
                ],
              },
              take: 8,
              orderBy: { updatedAt: "desc" },
            })
          : [],
      ])
    : [[], [], []];

  const total = leads.length + properties.length + tenants.length;

  return (
    <div>
      <PageHeader
        title="Search"
        description="Find leads, properties and tenants across the workspace."
      />
      <form className="mb-8 flex max-w-xl gap-2" action="/dashboard/search">
        <Input name="q" defaultValue={query} placeholder="Search by name, phone, title or reference" />
        <Button type="submit" variant="accent">
          Search
        </Button>
      </form>

      {!query ? (
        <EmptyState
          icon={Search}
          title="Search the workspace"
          description="Type a name, phone number, listing title or reference."
        />
      ) : total === 0 ? (
        <EmptyState
          icon={Search}
          title={`No results for “${query}”`}
          description="Try a shorter name, a phone number, or a property reference."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {canLeads ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leads ({leads.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href="/dashboard/leads"
                    className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-navy-50"
                  >
                    <p className="font-medium text-navy-900">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {lead.reference} · {statusLabel(lead.stage)}
                    </p>
                  </Link>
                ))}
                {leads.length === 0 ? (
                  <p className="text-sm text-slate-500">No matching leads</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {canProperties ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Properties ({properties.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    href="/dashboard/properties"
                    className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-navy-50"
                  >
                    <p className="font-medium text-navy-900">{property.title}</p>
                    <p className="text-xs text-slate-500">
                      {property.reference} ·{" "}
                      {formatCurrency(Number(property.price), property.currency)}
                    </p>
                  </Link>
                ))}
                {properties.length === 0 ? (
                  <p className="text-sm text-slate-500">No matching properties</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {canTenants ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tenants ({tenants.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tenants.map((tenant) => (
                  <Link
                    key={tenant.id}
                    href="/dashboard/tenants"
                    className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-navy-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-navy-900">
                        {tenant.firstName} {tenant.lastName}
                      </p>
                      <Badge variant="secondary">Tenant</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {tenant.phone ?? tenant.email ?? "No contact"}
                    </p>
                  </Link>
                ))}
                {tenants.length === 0 ? (
                  <p className="text-sm text-slate-500">No matching tenants</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
