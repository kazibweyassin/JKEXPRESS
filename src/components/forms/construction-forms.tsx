"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  assignProjectEmployee,
  assignProjectSubcontractor,
  createClientQuotation,
  createConstructionContract,
  createIpc,
  createWeeklyProgress,
  issueStockToProject,
  createConstructionProject,
  addProjectPlanItem,
  createBoq,
  createSiteReport,
  createVariationOrder,
  createPurchaseRequest,
} from "@/app/actions/construction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TEAM_ROLES } from "@/lib/construction-standards";

type Option = { id: string; label: string };

function FormFrame({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await onSubmit(formData);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <form action={handle} className="space-y-4">
      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

export function ClientQuotationForm({ projects }: { projects: Option[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [contingencyRate, setContingencyRate] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [taxRate, setTaxRate] = useState("18");
  const [items, setItems] = useState([
    { id: 1, section: "Preliminaries", description: "", quantity: "1", unit: "item", rate: "" },
  ]);

  function updateItem(
    id: number,
    field: "section" | "description" | "quantity" | "unit" | "rate",
    value: string,
  ) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
        section: current.at(-1)?.section || "General",
        description: "",
        quantity: "1",
        unit: "item",
        rate: "",
      },
    ]);
  }

  function removeItem(id: number) {
    setItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id),
    );
  }

  const serializedItems = items
    .map((item) =>
      [item.section || "General", item.description, item.quantity || "0", item.rate || "0", item.unit || "item"].join(" | "),
    )
    .join("\n");
  const quotationTotal = items.reduce(
    (total, item) => total + Number(item.quantity || 0) * Number(item.rate || 0),
    0,
  );
  const contingencyAmount = quotationTotal * (Number(contingencyRate || 0) / 100);
  const discountedTotal = Math.max(0, quotationTotal + contingencyAmount - Number(discount || 0));
  const taxAmount = discountedTotal * (Number(taxRate || 0) / 100);
  const grandTotal = discountedTotal + taxAmount;

  async function save(formData: FormData) {
    setPending(true);
    setMessage(null);
    const result = await createClientQuotation(formData);
    setPending(false);
    if (result.success) {
      setMessage("Saved to the system. Use Download PDF for the branded file.");
      return;
    }
    setMessage(result.error);
  }

  return (
    <form
      action="/dashboard/quotations/pdf"
      method="post"
      target="_blank"
      className="space-y-4"
    >
      {message ? (
        <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-900">
          {message}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Construction quotation — Kololo" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client</Label>
          <Input id="clientName" name="clientName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientPhone">Phone</Label>
          <Input id="clientPhone" name="clientPhone" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="clientAddress">Client address</Label><Input id="clientAddress" name="clientAddress" /></div>
        <div className="space-y-2"><Label htmlFor="siteLocation">Site location</Label><Input id="siteLocation" name="siteLocation" /></div>
        <div className="space-y-2"><Label htmlFor="revision">Revision</Label><Input id="revision" name="revision" type="number" min={0} defaultValue={0} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <Input id="clientEmail" name="clientEmail" type="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid until</Label>
          <Input id="validUntil" name="validUntil" type="date" />
        </div>
      </div>
      {projects.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="projectId">Linked project</Label>
          <Select id="projectId" name="projectId" defaultValue="">
            <option value="">None yet</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="projectName">Project name</Label>
        <Input
          id="projectName"
          name="projectName"
          placeholder="Kololo Office Complex"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>Line items</Label>
            <p className="mt-1 text-xs text-slate-500">
              Add each work item separately. Totals are calculated automatically.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" /> Add item
          </Button>
        </div>
        <input type="hidden" name="items" value={serializedItems} />
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="hidden grid-cols-[1fr_minmax(0,2fr)_0.65fr_0.65fr_0.9fr_0.9fr_2.5rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span>Section</span><span>Description</span><span>Qty</span><span>Unit</span><span>Rate</span><span>Total</span><span />
          </div>
          <div className="divide-y divide-slate-200">
            {items.map((item, index) => {
              const lineTotal = Number(item.quantity || 0) * Number(item.rate || 0);
              return (
                <div key={item.id} className="grid gap-3 p-3 md:grid-cols-[1fr_minmax(0,2fr)_0.65fr_0.65fr_0.9fr_0.9fr_2.5rem] md:items-center md:gap-2">
                  <div>
                    <Label htmlFor={`item-section-${item.id}`} className="mb-1 block text-xs md:hidden">Section</Label>
                    <Input id={`item-section-${item.id}`} list="quotation-sections" value={item.section} onChange={(event) => updateItem(item.id, "section", event.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor={`item-description-${item.id}`} className="mb-1 block text-xs md:hidden">Description</Label>
                    <Input id={`item-description-${item.id}`} value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} placeholder={`Item ${index + 1} description`} required />
                  </div>
                  <div>
                    <Label htmlFor={`item-quantity-${item.id}`} className="mb-1 block text-xs md:hidden">Quantity</Label>
                    <Input id={`item-quantity-${item.id}`} type="number" min="0.01" step="any" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor={`item-unit-${item.id}`} className="mb-1 block text-xs md:hidden">Unit</Label>
                    <Input id={`item-unit-${item.id}`} value={item.unit} onChange={(event) => updateItem(item.id, "unit", event.target.value)} placeholder="m²" required />
                  </div>
                  <div>
                    <Label htmlFor={`item-rate-${item.id}`} className="mb-1 block text-xs md:hidden">Rate (UGX)</Label>
                    <Input id={`item-rate-${item.id}`} type="number" min="0" step="any" value={item.rate} onChange={(event) => updateItem(item.id, "rate", event.target.value)} placeholder="0" required />
                  </div>
                  <div className="text-sm font-semibold text-navy-900">
                    <span className="mr-2 text-xs font-normal text-slate-500 md:hidden">Total:</span>
                    {new Intl.NumberFormat("en-UG").format(lineTotal)}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1} aria-label={`Remove item ${index + 1}`} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <datalist id="quotation-sections"><option value="Preliminaries" /><option value="Substructure" /><option value="Superstructure" /><option value="Roofing" /><option value="Finishes" /><option value="Mechanical & electrical" /><option value="External works" /></datalist>
          <div className="space-y-1 border-t border-slate-200 bg-navy-50 px-4 py-3 text-sm">
            <div className="flex justify-between"><span>BOQ subtotal</span><span>UGX {new Intl.NumberFormat("en-UG").format(quotationTotal)}</span></div>
            <div className="flex justify-between"><span>Contingency</span><span>UGX {new Intl.NumberFormat("en-UG").format(contingencyAmount)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>- UGX {new Intl.NumberFormat("en-UG").format(Number(discount || 0))}</span></div>
            <div className="flex justify-between"><span>VAT / tax</span><span>UGX {new Intl.NumberFormat("en-UG").format(taxAmount)}</span></div>
            <div className="mt-2 flex justify-between border-t border-navy-200 pt-2 text-lg font-bold text-navy-900"><span>Grand total</span><span>UGX {new Intl.NumberFormat("en-UG").format(grandTotal)}</span></div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="contingencyRate">Contingency (%)</Label><Input id="contingencyRate" name="contingencyRate" type="number" min={0} step="0.01" value={contingencyRate} onChange={(event) => setContingencyRate(event.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="discount">Discount (UGX)</Label><Input id="discount" name="discount" type="number" min={0} value={discount} onChange={(event) => setDiscount(event.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="taxRate">VAT / tax (%)</Label><Input id="taxRate" name="taxRate" type="number" min={0} step="0.01" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="scopeOfWorks">Scope of works</Label><Textarea id="scopeOfWorks" name="scopeOfWorks" rows={3} placeholder="Summarise the work covered by this quotation." /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="inclusions">Inclusions</Label><Textarea id="inclusions" name="inclusions" rows={3} placeholder="Labour, materials, supervision, equipment…" /></div>
        <div className="space-y-2"><Label htmlFor="exclusions">Exclusions</Label><Textarea id="exclusions" name="exclusions" rows={3} placeholder="Approvals, utility fees, unforeseen ground conditions…" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2"><Label htmlFor="paymentTerms">Payment terms</Label><Textarea id="paymentTerms" name="paymentTerms" rows={3} placeholder="30% mobilisation…" /></div>
        <div className="space-y-2"><Label htmlFor="duration">Construction duration</Label><Input id="duration" name="duration" placeholder="12 weeks" /></div>
        <div className="space-y-2"><Label htmlFor="warranty">Defects liability / warranty</Label><Input id="warranty" name="warranty" placeholder="6 months" /></div>
        <div className="space-y-2"><Label htmlFor="variationTerms">Variation terms</Label><Textarea id="variationTerms" name="variationTerms" rows={3} placeholder="Written approval before execution…" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="preparedBy">Prepared by</Label><Input id="preparedBy" name="preparedBy" /></div>
        <div className="space-y-2"><Label htmlFor="approvedBy">Approved by</Label><Input id="approvedBy" name="approvedBy" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="bankDetails">Payment / bank details</Label><Textarea id="bankDetails" name="bankDetails" rows={2} /></div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <input type="hidden" name="currency" value="UGX" />
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Download PDF</Button>
        <Button
          type="submit"
          variant="outline"
          formAction={save}
          disabled={pending}
        >
          {pending ? "Saving…" : "Save to system"}
        </Button>
      </div>
    </form>
  );
}

export function WeeklyProgressForm({
  projects,
  contractors,
}: {
  projects: Option[];
  contractors: Option[];
}) {
  return (
    <FormFrame onSubmit={createWeeklyProgress}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectId">Project</Label>
          <Select id="projectId" name="projectId" required defaultValue={projects[0]?.id ?? ""}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weekStarting">Week starting</Label>
          <Input id="weekStarting" name="weekStarting" type="date" required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contractorId">Subcontractor (source of update)</Label>
          <Select id="contractorId" name="contractorId" defaultValue="">
            <option value="">Company works package</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="progressPercent">Overall progress %</Label>
          <Input id="progressPercent" name="progressPercent" type="number" min={0} max={100} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="workCompleted">Work completed this week</Label>
        <Textarea id="workCompleted" name="workCompleted" rows={3} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="labourOnSite">Labour on site</Label>
          <Input id="labourOnSite" name="labourOnSite" type="number" min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weather">Weather</Label>
          <Input id="weather" name="weather" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="materialsOnSite">Materials</Label>
        <Textarea id="materialsOnSite" name="materialsOnSite" rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="delays">Delays / issues</Label>
        <Textarea id="delays" name="delays" rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="safetyNotes">Safety</Label>
        <Textarea id="safetyNotes" name="safetyNotes" rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nextWeekPlan">Next week plan</Label>
        <Textarea id="nextWeekPlan" name="nextWeekPlan" rows={2} />
      </div>
    </FormFrame>
  );
}

export function AssignEmployeeForm({
  projectId,
  employees,
}: {
  projectId: string;
  employees: Option[];
}) {
  return (
    <FormFrame onSubmit={assignProjectEmployee}>
      <input type="hidden" name="projectId" value={projectId} />
      <div className="space-y-2">
        <Label htmlFor="employeeId">Company employee</Label>
        <Select id="employeeId" name="employeeId" required defaultValue={employees[0]?.id ?? ""}>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role on this project</Label>
        <Select id="role" name="role" defaultValue="SITE_ENGINEER">
          {TEAM_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Select>
      </div>
    </FormFrame>
  );
}

export function AssignSubcontractorForm({
  projectId,
  contractors,
}: {
  projectId: string;
  contractors: Option[];
}) {
  return (
    <FormFrame onSubmit={assignProjectSubcontractor}>
      <input type="hidden" name="projectId" value={projectId} />
      <div className="space-y-2">
        <Label htmlFor="contractorId">Subcontractor</Label>
        <Select id="contractorId" name="contractorId" required defaultValue={contractors[0]?.id ?? ""}>
          {contractors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="packageName">Works package</Label>
        <Input id="packageName" name="packageName" required placeholder="Electrical, finishes, steel…" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contractSum">Package sum (UGX)</Label>
        <Input id="contractSum" name="contractSum" type="number" min={0} />
      </div>
    </FormFrame>
  );
}

export function ConstructionContractForm({
  projects,
  contractors,
}: {
  projects: Option[];
  contractors: Option[];
}) {
  const router = useRouter();
  return (
    <FormFrame
      onSubmit={async (data) => {
        const result = await createConstructionContract(data);
        if (result.success) router.push("/dashboard/contracts");
        return result;
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Contract title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectId">Project</Label>
          <Select id="projectId" name="projectId" required defaultValue={projects[0]?.id ?? ""}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contractorId">Subcontractor (subcontracts only)</Label>
          <Select id="contractorId" name="contractorId" defaultValue="">
            <option value="">Main contract (client)</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select id="type" name="type" defaultValue="MAIN">
            <option value="MAIN">Main contract</option>
            <option value="SUB">Subcontract</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="formOfContract">Form</Label>
          <Select id="formOfContract" name="formOfContract" defaultValue="FIDIC">
            <option value="FIDIC">FIDIC</option>
            <option value="MOWT">Ministry of Works</option>
            <option value="BESPOKE">Bespoke</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contractSum">Contract sum (UGX)</Label>
          <Input id="contractSum" name="contractSum" type="number" min={0} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="specifications">Specifications</Label>
        <Textarea
          id="specifications"
          name="specifications"
          rows={5}
          placeholder={"1.1: Concrete to BS 8500\n1.2: Reinforcement to BS 4449"}
        />
        <p className="text-xs text-slate-500">One clause per line: clause : title</p>
      </div>
    </FormFrame>
  );
}

export function IpcForm({ contracts }: { contracts: Option[] }) {
  return (
    <FormFrame onSubmit={createIpc}>
      <div className="space-y-2">
        <Label htmlFor="contractId">Contract</Label>
        <Select id="contractId" name="contractId" required defaultValue={contracts[0]?.id ?? ""}>
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="grossAmount">Gross amount</Label>
          <Input id="grossAmount" name="grossAmount" type="number" min={0} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retention">Retention</Label>
          <Input id="retention" name="retention" type="number" min={0} defaultValue={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="previousPaid">Previously certified</Label>
          <Input id="previousPaid" name="previousPaid" type="number" min={0} defaultValue={0} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
    </FormFrame>
  );
}

export function IssueStockForm({
  items,
  projects,
}: {
  items: Option[];
  projects: Option[];
}) {
  return (
    <FormFrame onSubmit={issueStockToProject}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="itemId">Store item</Label>
          <Select id="itemId" name="itemId" required defaultValue={items[0]?.id ?? ""}>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectId">Issue to project</Label>
          <Select id="projectId" name="projectId" defaultValue="">
            <option value="">General issue</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min={0.01} step="0.01" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>
    </FormFrame>
  );
}

export function ConstructionProjectForm({ managers }: { managers: Option[] }) {
  const router = useRouter();
  return <FormFrame onSubmit={async (data) => {
    const result = await createConstructionProject(data);
    if (result.success && result.id) router.push(`/dashboard/projects/${result.id}`);
    return result;
  }}>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="name">Project name</Label><Input id="name" name="name" required /></div>
      <div className="space-y-2"><Label htmlFor="clientName">Client</Label><Input id="clientName" name="clientName" /></div>
      <div className="space-y-2"><Label htmlFor="location">Site location</Label><Input id="location" name="location" /></div>
      <div className="space-y-2"><Label htmlFor="city">City / district</Label><Input id="city" name="city" /></div>
      <div className="space-y-2"><Label htmlFor="startDate">Start date</Label><Input id="startDate" name="startDate" type="date" /></div>
      <div className="space-y-2"><Label htmlFor="expectedCompletion">Target completion</Label><Input id="expectedCompletion" name="expectedCompletion" type="date" /></div>
      <div className="space-y-2"><Label htmlFor="contractValue">Contract value (UGX)</Label><Input id="contractValue" name="contractValue" type="number" min={0} /></div>
      <div className="space-y-2"><Label htmlFor="approvedBudget">Approved budget (UGX)</Label><Input id="approvedBudget" name="approvedBudget" type="number" min={0} /></div>
    </div>
    <div className="space-y-2"><Label htmlFor="projectManagerId">Project manager</Label><Select id="projectManagerId" name="projectManagerId" defaultValue=""><option value="">Assign later</option>{managers.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</Select></div>
    <div className="space-y-2"><Label htmlFor="description">Scope summary</Label><Textarea id="description" name="description" rows={4} /></div>
  </FormFrame>;
}

export function ProjectPlanItemForm({ projectId }: { projectId: string }) {
  return <FormFrame onSubmit={addProjectPlanItem}>
    <input type="hidden" name="projectId" value={projectId} />
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="kind">Type</Label><Select id="kind" name="kind"><option value="PHASE">Phase</option><option value="MILESTONE">Milestone</option><option value="TASK">Task</option></Select></div>
      <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
      <div className="space-y-2"><Label htmlFor="dueDate">Due date</Label><Input id="dueDate" name="dueDate" type="date" /></div>
    </div>
  </FormFrame>;
}

export function BoqForm({ projectId }: { projectId: string }) {
  return <FormFrame onSubmit={createBoq}>
    <input type="hidden" name="projectId" value={projectId} />
    <div className="space-y-2"><Label htmlFor="title">BOQ title</Label><Input id="title" name="title" required defaultValue="Contract BOQ" /></div>
    <div className="space-y-2"><Label htmlFor="items">Items</Label><Textarea id="items" name="items" rows={7} required placeholder={"Substructure | 1.1 | Excavation | m3 | 120 | 45000\nConcrete | 2.1 | Reinforced concrete | m3 | 80 | 650000"} /><p className="text-xs text-slate-500">One line: section | item number | description | unit | quantity | rate</p></div>
  </FormFrame>;
}

export function SiteDiaryForm({ projectId }: { projectId: string }) {
  return <FormFrame onSubmit={createSiteReport}>
    <input type="hidden" name="projectId" value={projectId} />
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="reportDate">Report date</Label><Input id="reportDate" name="reportDate" type="date" required /></div>
      <div className="space-y-2"><Label htmlFor="weather">Weather</Label><Input id="weather" name="weather" /></div>
      <div className="space-y-2"><Label htmlFor="workersPresent">Labour on site</Label><Input id="workersPresent" name="workersPresent" type="number" min={0} /></div>
    </div>
    <div className="space-y-2"><Label htmlFor="workCompleted">Work completed</Label><Textarea id="workCompleted" name="workCompleted" required /></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="equipmentUsed">Plant and equipment</Label><Textarea id="equipmentUsed" name="equipmentUsed" rows={2} /></div><div className="space-y-2"><Label htmlFor="materialsReceived">Materials received</Label><Textarea id="materialsReceived" name="materialsReceived" rows={2} /></div></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="safetyObservations">Safety observations</Label><Textarea id="safetyObservations" name="safetyObservations" rows={2} /></div><div className="space-y-2"><Label htmlFor="delays">Delays and constraints</Label><Textarea id="delays" name="delays" rows={2} /></div></div>
    <div className="space-y-2"><Label htmlFor="nextDayPlan">Next-day plan</Label><Textarea id="nextDayPlan" name="nextDayPlan" rows={2} /></div>
    <div className="space-y-2"><Label htmlFor="photoUrls">Photo URLs</Label><Textarea id="photoUrls" name="photoUrls" rows={2} placeholder="One image URL per line" /></div>
  </FormFrame>;
}

export function VariationOrderForm({ projectId }: { projectId: string }) {
  return <FormFrame onSubmit={createVariationOrder}>
    <input type="hidden" name="projectId" value={projectId} />
    <div className="space-y-2"><Label htmlFor="title">Variation title</Label><Input id="title" name="title" required /></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="amount">Value (UGX)</Label><Input id="amount" name="amount" type="number" /></div><div className="space-y-2"><Label htmlFor="extensionDays">Extension of time (days)</Label><Input id="extensionDays" name="extensionDays" type="number" min={0} /></div></div>
    <div className="space-y-2"><Label htmlFor="reason">Reason</Label><Input id="reason" name="reason" /></div>
    <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" /></div>
  </FormFrame>;
}

export function PurchaseRequestForm({ projects }: { projects: Option[] }) {
  return <FormFrame onSubmit={createPurchaseRequest}>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="title">Request title</Label><Input id="title" name="title" required /></div><div className="space-y-2"><Label htmlFor="projectId">Project</Label><Select id="projectId" name="projectId" defaultValue=""><option value="">General procurement</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</Select></div></div>
    <div className="space-y-2"><Label htmlFor="justification">Justification</Label><Textarea id="justification" name="justification" rows={2} /></div>
    <div className="space-y-2"><Label htmlFor="items">Items</Label><Textarea id="items" name="items" rows={5} required placeholder={"Cement 42.5N | 200 | bags | 38000\nY12 reinforcement | 150 | lengths | 52000"} /><p className="text-xs text-slate-500">One line: description | quantity | unit | estimated rate</p></div>
  </FormFrame>;
}
