"use client";

import {
  completeInspection,
  createClient,
  createDashboardLead,
  createDocument,
  createEmployee,
  createInspection,
  createLease,
  createTenant,
  createUnit,
  setLeadStage,
  updateEmployee,
  updateLeaseStatus,
  updateUnitStatus,
} from "@/app/actions/directory";
import { FormFrame } from "@/components/forms/form-frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Option = { id: string; label: string };

export function EmployeeForm({
  roles,
  departments,
}: {
  roles: Option[];
  departments: Option[];
}) {
  return (
    <FormFrame onSubmit={createEmployee} submitLabel="Add employee">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="emp-name">Name</Label><Input id="emp-name" name="name" required /></div>
        <div className="space-y-2"><Label htmlFor="emp-email">Email</Label><Input id="emp-email" name="email" type="email" required /></div>
        <div className="space-y-2"><Label htmlFor="emp-password">Temporary password</Label><Input id="emp-password" name="password" type="password" minLength={8} required /></div>
        <div className="space-y-2"><Label htmlFor="emp-phone">Phone</Label><Input id="emp-phone" name="phone" /></div>
        <div className="space-y-2">
          <Label htmlFor="emp-role">Role</Label>
          <Select id="emp-role" name="roleId" required defaultValue={roles[0]?.id ?? ""}>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-dept">Department</Label>
          <Select id="emp-dept" name="departmentId" defaultValue="">
            <option value="">None</option>
            {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2"><Label htmlFor="emp-title">Job title</Label><Input id="emp-title" name="jobTitle" /></div>
        <div className="space-y-2"><Label htmlFor="emp-hire">Hire date</Label><Input id="emp-hire" name="hireDate" type="date" /></div>
      </div>
    </FormFrame>
  );
}

export function EmployeeStatusForm({
  id,
  status,
  roles,
  roleId,
}: {
  id: string;
  status: string;
  roles: Option[];
  roleId: string;
}) {
  return (
    <FormFrame onSubmit={updateEmployee} submitLabel="Update">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Select name="employmentStatus" defaultValue={status}>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
        <Select name="roleId" defaultValue={roleId}>
          {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
        </Select>
      </div>
    </FormFrame>
  );
}

export function DocumentForm({
  properties,
  projects,
}: {
  properties: Option[];
  projects: Option[];
}) {
  return (
    <FormFrame onSubmit={createDocument} submitLabel="Upload to R2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="doc-title">Title</Label><Input id="doc-title" name="title" required /></div>
        <div className="space-y-2">
          <Label htmlFor="doc-category">Category</Label>
          <Select id="doc-category" name="category" defaultValue="CONTRACT">
            <option value="CONTRACT">Contract</option>
            <option value="PERMIT">Permit</option>
            <option value="REPORT">Report</option>
            <option value="INVOICE">Invoice</option>
            <option value="DRAWING">Drawing</option>
            <option value="GENERAL">General</option>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="doc-file">File</Label>
          <Input
            id="doc-file"
            name="file"
            type="file"
            required
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,.txt,application/pdf"
          />
          <p className="text-xs text-slate-500">
            Uploaded to Cloudflare R2. PDF, Word, Excel, image, zip or text. 25 MB max.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-property">Property</Label>
          <Select id="doc-property" name="propertyId" defaultValue="">
            <option value="">None</option>
            {properties.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-project">Project</Label>
          <Select id="doc-project" name="projectId" defaultValue="">
            <option value="">None</option>
            {projects.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="doc-notes">Description</Label><Textarea id="doc-notes" name="description" rows={2} /></div>
      </div>
    </FormFrame>
  );
}

export function ClientForm() {
  return (
    <FormFrame onSubmit={createClient} submitLabel="Add client">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="client-first">First name</Label><Input id="client-first" name="firstName" required /></div>
        <div className="space-y-2"><Label htmlFor="client-last">Last name</Label><Input id="client-last" name="lastName" required /></div>
        <div className="space-y-2">
          <Label htmlFor="client-type">Type</Label>
          <Select id="client-type" name="type" defaultValue="CLIENT">
            <option value="CLIENT">Client</option>
            <option value="BUYER">Buyer</option>
          </Select>
        </div>
        <div className="space-y-2"><Label htmlFor="client-company">Company</Label><Input id="client-company" name="company" /></div>
        <div className="space-y-2"><Label htmlFor="client-email">Email</Label><Input id="client-email" name="email" type="email" /></div>
        <div className="space-y-2"><Label htmlFor="client-phone">Phone</Label><Input id="client-phone" name="phone" /></div>
        <div className="space-y-2"><Label htmlFor="client-city">City</Label><Input id="client-city" name="city" /></div>
        <div className="space-y-2"><Label htmlFor="client-address">Address</Label><Input id="client-address" name="address" /></div>
      </div>
    </FormFrame>
  );
}

export function TenantForm() {
  return (
    <FormFrame onSubmit={createTenant} submitLabel="Add tenant">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="tenant-first">First name</Label><Input id="tenant-first" name="firstName" required /></div>
        <div className="space-y-2"><Label htmlFor="tenant-last">Last name</Label><Input id="tenant-last" name="lastName" required /></div>
        <div className="space-y-2"><Label htmlFor="tenant-email">Email</Label><Input id="tenant-email" name="email" type="email" /></div>
        <div className="space-y-2"><Label htmlFor="tenant-phone">Phone</Label><Input id="tenant-phone" name="phone" /></div>
        <div className="space-y-2"><Label htmlFor="tenant-id">ID number</Label><Input id="tenant-id" name="idNumber" /></div>
        <div className="space-y-2"><Label htmlFor="tenant-nat">Nationality</Label><Input id="tenant-nat" name="nationality" defaultValue="Ugandan" /></div>
      </div>
    </FormFrame>
  );
}

export function UnitForm({ properties }: { properties: Option[] }) {
  return (
    <FormFrame onSubmit={createUnit} submitLabel="Add unit">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="unit-property">Property</Label>
          <Select id="unit-property" name="propertyId" required defaultValue={properties[0]?.id ?? ""}>
            {properties.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2"><Label htmlFor="unit-number">Unit number</Label><Input id="unit-number" name="unitNumber" required /></div>
        <div className="space-y-2">
          <Label htmlFor="unit-type">Type</Label>
          <Select id="unit-type" name="unitType" defaultValue="2BR">
            <option value="STUDIO">Studio</option>
            <option value="1BR">1 bedroom</option>
            <option value="2BR">2 bedroom</option>
            <option value="3BR">3 bedroom</option>
            <option value="SHOP">Shop</option>
            <option value="OFFICE">Office</option>
          </Select>
        </div>
        <div className="space-y-2"><Label htmlFor="unit-rent">Monthly rent (UGX)</Label><Input id="unit-rent" name="monthlyRent" type="number" min={0} /></div>
      </div>
    </FormFrame>
  );
}

export function UnitStatusForm({ id, status }: { id: string; status: string }) {
  return (
    <FormFrame onSubmit={updateUnitStatus} submitLabel="Update">
      <input type="hidden" name="id" value={id} />
      <Select name="status" defaultValue={status}>
        <option value="VACANT">Vacant</option>
        <option value="RESERVED">Reserved</option>
        <option value="OCCUPIED">Occupied</option>
        <option value="UNDER_MAINTENANCE">Under maintenance</option>
        <option value="UNAVAILABLE">Unavailable</option>
      </Select>
    </FormFrame>
  );
}

export function LeaseForm({ tenants, units }: { tenants: Option[]; units: Option[] }) {
  return (
    <FormFrame onSubmit={createLease} submitLabel="Create lease">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lease-tenant">Tenant</Label>
          <Select id="lease-tenant" name="tenantId" required defaultValue={tenants[0]?.id ?? ""}>
            {tenants.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lease-unit">Unit</Label>
          <Select id="lease-unit" name="unitId" required defaultValue={units[0]?.id ?? ""}>
            {units.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2"><Label htmlFor="lease-start">Start</Label><Input id="lease-start" name="startDate" type="date" required /></div>
        <div className="space-y-2"><Label htmlFor="lease-end">End</Label><Input id="lease-end" name="endDate" type="date" required /></div>
        <div className="space-y-2"><Label htmlFor="lease-rent">Monthly rent (UGX)</Label><Input id="lease-rent" name="monthlyRent" type="number" min={0} required /></div>
        <div className="space-y-2"><Label htmlFor="lease-deposit">Deposit (UGX)</Label><Input id="lease-deposit" name="deposit" type="number" min={0} /></div>
      </div>
    </FormFrame>
  );
}

export function LeaseStatusForm({ id, status }: { id: string; status: string }) {
  return (
    <FormFrame onSubmit={updateLeaseStatus} submitLabel="Update">
      <input type="hidden" name="id" value={id} />
      <Select name="status" defaultValue={status}>
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Active</option>
        <option value="EXPIRING">Expiring</option>
        <option value="EXPIRED">Expired</option>
        <option value="TERMINATED">Terminated</option>
        <option value="RENEWED">Renewed</option>
      </Select>
    </FormFrame>
  );
}

export function InspectionForm({ properties, units }: { properties: Option[]; units: Option[] }) {
  return (
    <FormFrame onSubmit={createInspection} submitLabel="Schedule inspection">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="insp-property">Property</Label>
          <Select id="insp-property" name="propertyId" required defaultValue={properties[0]?.id ?? ""}>
            {properties.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="insp-unit">Unit</Label>
          <Select id="insp-unit" name="unitId" defaultValue="">
            <option value="">Whole property</option>
            {units.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="insp-type">Type</Label>
          <Select id="insp-type" name="type" defaultValue="ROUTINE">
            <option value="MOVE_IN">Move in</option>
            <option value="ROUTINE">Routine</option>
            <option value="MOVE_OUT">Move out</option>
            <option value="MAINTENANCE_FOLLOW_UP">Maintenance follow-up</option>
          </Select>
        </div>
        <div className="space-y-2"><Label htmlFor="insp-date">Scheduled</Label><Input id="insp-date" name="scheduledAt" type="date" /></div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="insp-notes">Notes</Label><Textarea id="insp-notes" name="notes" rows={2} /></div>
      </div>
    </FormFrame>
  );
}

export function CompleteInspectionForm({ id }: { id: string }) {
  return (
    <FormFrame onSubmit={completeInspection} submitLabel="Mark complete">
      <input type="hidden" name="id" value={id} />
      <Select name="overallRating" defaultValue="GOOD">
        <option value="GOOD">Good</option>
        <option value="FAIR">Fair</option>
        <option value="POOR">Poor</option>
      </Select>
    </FormFrame>
  );
}

export function LeadForm({ properties }: { properties: Option[] }) {
  return (
    <FormFrame onSubmit={createDashboardLead} submitLabel="Add lead">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="lead-first">First name</Label><Input id="lead-first" name="firstName" required /></div>
        <div className="space-y-2"><Label htmlFor="lead-last">Last name</Label><Input id="lead-last" name="lastName" required /></div>
        <div className="space-y-2"><Label htmlFor="lead-phone">Phone</Label><Input id="lead-phone" name="phone" required /></div>
        <div className="space-y-2"><Label htmlFor="lead-email">Email</Label><Input id="lead-email" name="email" type="email" /></div>
        <div className="space-y-2">
          <Label htmlFor="lead-source">Source</Label>
          <Select id="lead-source" name="source" defaultValue="WALK_IN">
            <option value="WALK_IN">Walk-in</option>
            <option value="PHONE">Phone</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-property">Property</Label>
          <Select id="lead-property" name="propertyId" defaultValue="">
            <option value="">None</option>
            {properties.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </div>
      </div>
    </FormFrame>
  );
}

export function LeadStageForm({ id, stage }: { id: string; stage: string }) {
  return (
    <FormFrame onSubmit={setLeadStage} submitLabel="Update">
      <input type="hidden" name="id" value={id} />
      <Select name="stage" defaultValue={stage}>
        <option value="NEW">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="QUALIFIED">Qualified</option>
        <option value="VIEWING_SCHEDULED">Viewing scheduled</option>
        <option value="PROPOSAL_SENT">Proposal sent</option>
        <option value="NEGOTIATION">Negotiation</option>
        <option value="RESERVED">Reserved</option>
        <option value="WON">Won</option>
        <option value="LOST">Lost</option>
      </Select>
    </FormFrame>
  );
}
