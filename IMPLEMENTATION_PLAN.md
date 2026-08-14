You are a senior full-stack software architect and product designer. Build a production-ready web application for a construction, real estate, and property management company.

The platform must serve two purposes:

1. A professional public company website.
2. A secure internal management system for employees, managers, property owners, tenants, buyers, suppliers, and contractors.

Do not build only a static dashboard or UI mock-up. Build a functional, scalable application with authentication, database models, permissions, forms, validation, file uploads, reporting, and realistic sample data.

## Project identity

Use the following temporary project information:

* Company name: [COMPANY NAME]
* Industry: Construction, Real Estate and Property Management
* Primary market: Uganda and East Africa
* Default currency: UGX
* Secondary currency support: USD
* Timezone: Africa/Kampala
* Language: English
* Design style: Modern, professional, trustworthy, premium and corporate
* Brand colours: Deep navy, construction gold, white and neutral grey
* Contact information: Use clearly marked placeholders

The company name, logo, colours, contact details, currencies and social links must be editable from the administration settings.

## Technology stack

Use:

* Latest stable Next.js with App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* PostgreSQL
* Prisma ORM
* Auth.js or another secure authentication solution compatible with Next.js
* Zod for validation
* React Hook Form
* TanStack Table for data tables
* Recharts for dashboard charts
* Cloudinary, Amazon S3 or another configurable object-storage service for documents and images
* Resend-compatible email service
* ESLint and Prettier

Use a modular architecture that can later support a mobile application and external API integrations.

Do not hard-code confidential credentials. Create a `.env.example` file containing all required environment variables.

## Core application areas

Create four connected areas:

1. Public website
2. Client and tenant portal
3. Employee workspace
4. Executive and administration dashboard

## Public website

Create a responsive public website with the following pages:

* Home
* About Us
* Construction Services
* Real Estate Services
* Property Management Services
* Properties for Sale
* Properties for Rent
* Property Details
* Completed Projects
* Ongoing Projects
* Project Details
* News and Insights
* Careers
* Request a Quotation
* Schedule a Property Viewing
* Contact Us
* Privacy Policy
* Terms and Conditions

### Homepage sections

The homepage should include:

* Hero section with a strong value proposition
* Featured properties
* Construction and property-management services
* Ongoing and completed projects
* Company statistics
* Why choose us
* Property search
* Client testimonials
* Latest news
* Call-to-action section
* Contact details and map placeholder

### Property listings

Each property must support:

* Property reference number
* Property title
* Property description
* Property type
* Listing type: sale or rent
* Country
* District or city
* Address
* Latitude and longitude
* Price
* Currency
* Bedrooms
* Bathrooms
* Parking spaces
* Property size
* Land size
* Furnishing status
* Amenities
* Featured image
* Image gallery
* Video URL
* Virtual-tour URL
* Brochure
* Assigned sales agent
* Property owner
* Availability status
* Featured status
* Publication status
* Date listed

Property statuses should include:

* Draft
* Available
* Reserved
* Rented
* Sold
* Under maintenance
* Unavailable

Visitors must be able to:

* Search properties
* Filter by location, type, price, bedrooms and listing type
* View property details
* Request more information
* Schedule a viewing
* Share a property
* Download a brochure
* Contact the assigned agent through a configurable WhatsApp link

Every public inquiry must automatically create a CRM lead.

## Authentication and user roles

Create secure authentication with:

* Email and password
* Password reset
* Email verification
* Session management
* Account activation and deactivation
* Optional future two-factor authentication support

Create role-based access control.

Required roles:

* Super Administrator
* Managing Director
* Operations Manager
* Project Manager
* Site Engineer
* Quantity Surveyor
* Property Manager
* Sales Manager
* Sales Agent
* Procurement Officer
* Storekeeper
* Accountant
* Human Resource Officer
* Maintenance Officer
* Technician
* Receptionist
* Property Owner
* Tenant
* Buyer
* Supplier
* Contractor

Permissions must not be controlled only by hiding menu items. Protect server actions, API routes and database operations.

Create a permission model that allows administrators to define which roles can:

* View
* Create
* Edit
* Delete
* Approve
* Export
* Publish
* Assign

## Internal dashboard

Create a responsive dashboard layout with:

* Collapsible sidebar
* Top navigation
* Global search
* Notification centre
* User profile menu
* Breadcrumbs
* Mobile navigation
* Quick-create menu

The dashboard must work properly on desktop, tablet and mobile devices.

## Executive dashboard

Display:

* Active construction projects
* Completed projects
* Total properties
* Available properties
* Occupied units
* Vacant units
* Occupancy rate
* Total rent invoiced
* Rent collected
* Outstanding rent
* Property sales pipeline value
* Project budget versus actual expenditure
* Pending approvals
* Open maintenance requests
* Expiring leases
* Recent activities

Use metric cards, charts and actionable lists. All dashboard values must come from the database instead of hard-coded numbers.

## CRM and lead management

Create a CRM module containing:

* Leads
* Clients
* Buyers
* Property owners
* Tenants
* Suppliers
* Contractors
* Communication history
* Follow-up activities
* Appointments
* Notes
* Attachments

Lead sources should include:

* Website
* WhatsApp
* Phone call
* Email
* Social media
* Referral
* Walk-in
* Advertisement
* Other

Lead stages:

* New
* Contacted
* Qualified
* Viewing scheduled
* Proposal sent
* Negotiation
* Reserved
* Won
* Lost

Employees must be able to:

* Assign leads
* Add notes
* Schedule follow-ups
* Record calls and meetings
* Convert leads into clients
* Link clients to properties
* Mark leads as won or lost
* Record the reason a lead was lost

## Construction project management

Create a construction-management module containing:

* Projects
* Project phases
* Milestones
* Tasks
* Team assignments
* Project budgets
* Contractors
* Project documents
* Site reports
* Project issues
* Project variations
* Progress updates
* Project photographs

Each construction project should contain:

* Project code
* Project name
* Client
* Project manager
* Location
* Description
* Start date
* Expected completion date
* Actual completion date
* Contract value
* Approved budget
* Current expenditure
* Completion percentage
* Status
* Project team
* Documents
* Images

Project statuses:

* Planning
* Awaiting approval
* Active
* On hold
* Delayed
* Completed
* Cancelled

### Task management

Tasks must support:

* Title
* Description
* Project
* Phase
* Assignee
* Priority
* Start date
* Due date
* Status
* Completion percentage
* Dependencies
* Attachments
* Comments

Task statuses:

* Not started
* In progress
* Under review
* Blocked
* Completed
* Cancelled

## Daily site reports

Create a mobile-friendly daily site-report form.

The report should capture:

* Project
* Report date
* Submitted by
* Weather
* Workers present
* Contractors present
* Work completed
* Equipment used
* Materials received
* Materials consumed
* Safety observations
* Delays
* Incidents
* Problems requiring management attention
* Site photographs
* Next-day plan

Project managers should be able to review and approve site reports.

## Bill of Quantities

Create a basic BOQ module.

BOQs should support:

* Project
* Section
* Item number
* Description
* Unit
* Estimated quantity
* Unit rate
* Estimated total
* Actual quantity
* Actual cost
* Variance
* Notes

Calculate totals and variances automatically.

Allow BOQ import and export through CSV. Structure the system so Excel import can be added later.

## Procurement management

Create:

* Purchase requests
* Supplier quotations
* Quotation comparisons
* Purchase orders
* Goods received notes
* Supplier invoices
* Procurement approvals
* Supplier directory

Purchase-request workflow:

1. Employee submits request.
2. Project manager reviews the request.
3. Procurement officer obtains quotations.
4. Authorised manager approves the selected quotation.
5. Purchase order is created.
6. Goods are delivered.
7. Storekeeper confirms receipt.
8. Finance records the supplier invoice and payment.

Every approval or rejection must record:

* User
* Date
* Decision
* Comment

## Inventory and equipment management

Create inventory management for:

* Construction materials
* Tools
* Machinery
* Safety equipment
* Office supplies
* Spare parts

Support:

* Warehouses and site stores
* Stock receipts
* Stock issues
* Stock transfers
* Stock adjustments
* Damaged stock
* Lost stock
* Reorder levels
* Low-stock notifications
* Inventory valuation
* Material allocation to projects

Equipment should support:

* Equipment code
* Name
* Category
* Purchase date
* Current condition
* Current location
* Assigned employee or project
* Maintenance history
* Next service date

## Real estate sales management

Create:

* Property inventory
* Buyer profiles
* Property viewings
* Property reservations
* Offers
* Sale agreements
* Installment plans
* Property handovers
* Agent commissions

Viewing records should include:

* Property
* Client
* Assigned agent
* Date and time
* Status
* Client feedback
* Follow-up date

Reservation records should include:

* Property
* Client
* Reservation date
* Expiry date
* Reservation fee
* Payment status
* Notes

Prevent two active reservations for the same property unless an administrator overrides the restriction.

## Property management

Create a complete property-management module.

The property hierarchy should support:

* Property owner
* Property
* Building
* Floor
* Unit

Units should contain:

* Unit number
* Unit type
* Bedrooms
* Bathrooms
* Monthly rent
* Service charge
* Deposit required
* Occupancy status
* Current tenant

Unit statuses:

* Vacant
* Reserved
* Occupied
* Under maintenance
* Unavailable

## Tenant and lease management

Create:

* Tenant applications
* Tenant profiles
* Tenant documents
* Lease agreements
* Lease renewals
* Move-in records
* Move-out records
* Security deposits
* Tenant statements

Lease records should contain:

* Tenant
* Property
* Unit
* Lease start date
* Lease end date
* Monthly rent
* Service charge
* Deposit
* Payment due date
* Grace period
* Late fee
* Billing frequency
* Lease status
* Uploaded agreement

Lease statuses:

* Draft
* Pending approval
* Active
* Expiring
* Expired
* Terminated
* Renewed

Display alerts for leases expiring within 90, 60 and 30 days.

## Rent and payment management

Create operational financial features for property management.

Support:

* Recurring rent invoices
* Manual invoices
* Partial payments
* Overpayments
* Credit balances
* Payment allocations
* Outstanding balances
* Arrears
* Security deposits
* Payment receipts
* Owner payouts
* Management fees
* Property expenses

Payment methods:

* Cash
* Bank transfer
* Mobile money
* Card
* Cheque
* Other

The application should be designed for future integrations with payment providers such as Flutterwave, Pesapal, Airtel Money and MTN Mobile Money.

Do not implement live payment integrations without credentials. Create clean provider interfaces and mock implementations.

Generate printable rent receipts containing:

* Company information
* Receipt number
* Tenant
* Property and unit
* Amount paid
* Payment date
* Payment method
* Invoice allocation
* Balance
* Received by

## Property-owner portal

Property owners should be able to view only their own:

* Properties
* Units
* Occupancy information
* Rent collected
* Property expenses
* Management fees
* Net amount payable
* Monthly statements
* Maintenance activity
* Uploaded documents

They must not see other owners’ information.

## Tenant portal

Tenants should be able to view:

* Current lease
* Rent invoices
* Payment history
* Outstanding balance
* Receipts
* Maintenance requests
* Lease documents
* Company announcements

Tenants should be able to:

* Submit maintenance requests
* Upload photographs
* Download receipts
* Download lease documents
* Update limited profile information

## Maintenance management

Create maintenance tickets containing:

* Ticket number
* Property
* Unit
* Tenant
* Category
* Description
* Priority
* Assigned technician
* Service provider
* Reported date
* Scheduled date
* Completion date
* Estimated cost
* Actual cost
* Materials used
* Before photographs
* After photographs
* Tenant feedback

Ticket statuses:

* Reported
* Reviewed
* Assigned
* In progress
* Awaiting materials
* Completed
* Inspected
* Closed
* Cancelled

Priorities:

* Low
* Normal
* High
* Emergency

## Property inspections

Create inspections for:

* Move-in
* Routine inspection
* Move-out
* Maintenance follow-up

Inspection forms should support:

* Checklist items
* Condition rating
* Comments
* Photographs
* Damage assessment
* Estimated repair cost
* Tenant acknowledgement
* Inspector approval

## Finance and expense management

Create operational finance modules containing:

* Income
* Expenses
* Invoices
* Payments
* Supplier bills
* Project expenses
* Property expenses
* Petty cash
* Employee advances
* Approval requests

Separate financial records by:

* Company operations
* Construction project
* Property
* Property owner

Do not attempt to create a complete double-entry accounting system in the first release. Design clean interfaces for later integration with accounting software.

## Human resources

Create:

* Employee profiles
* Departments
* Job titles
* Employment status
* Emergency contacts
* Employee documents
* Attendance
* Leave requests
* Timesheets
* Site assignments
* Performance notes
* Internal announcements

Protect private employee information with appropriate permissions.

## Document management

Create a document-management module supporting:

* Folders
* Categories
* File uploads
* File descriptions
* Version numbers
* Expiry dates
* Related records
* Access restrictions
* Upload history
* Download history

Document categories should include:

* Land titles
* Lease agreements
* Sale agreements
* Construction contracts
* Architectural drawings
* Building permits
* BOQs
* Supplier quotations
* Purchase orders
* Inspection reports
* Tenant identification
* Employee documents
* Payment receipts

Validate file type and file size.

## Notifications

Create in-app notifications for:

* New leads
* Follow-ups due
* Property-viewing reminders
* Rent due
* Rent overdue
* Lease expiry
* Maintenance assignment
* Purchase requests awaiting approval
* Low stock
* Project task overdue
* Project milestone overdue
* Document expiry
* Payment received

Create notification-service interfaces for future email, SMS and WhatsApp integrations.

## Reports

Create filterable reports for:

* Property occupancy
* Available units
* Rent collection
* Rent arrears
* Expiring leases
* Property-owner statements
* Property income and expenses
* Construction-project progress
* Project budget versus actual cost
* Procurement expenditure
* Inventory movement
* Maintenance costs
* Sales pipeline
* Agent performance
* Employee attendance

Reports should support:

* Date filters
* Property filters
* Project filters
* Employee filters
* Status filters
* CSV export
* Print-friendly layouts

## Administration settings

Create an administration area containing:

* Company profile
* Logo and branding
* Branches
* Departments
* User accounts
* Roles
* Permissions
* Property types
* Project categories
* Expense categories
* Payment methods
* Taxes
* Currencies
* Numbering formats
* Email templates
* Notification settings
* System audit logs

## Audit logs

Record important activity, including:

* Login attempts
* Record creation
* Record updates
* Record deletion
* Approval decisions
* Payment changes
* Permission changes
* Document downloads
* Property publication
* Lease changes

Audit records should contain:

* User
* Action
* Entity type
* Entity ID
* Timestamp
* IP address when available
* Previous values
* New values

## Database design

Create a properly normalised Prisma schema.

Important entities should include:

* User
* Role
* Permission
* RolePermission
* Employee
* Department
* Contact
* Lead
* LeadActivity
* PropertyOwner
* Property
* Building
* Unit
* PropertyImage
* PropertyAmenity
* Viewing
* Reservation
* Tenant
* TenantApplication
* Lease
* Invoice
* InvoiceItem
* Payment
* PaymentAllocation
* Receipt
* SecurityDeposit
* OwnerStatement
* PropertyExpense
* MaintenanceTicket
* MaintenanceUpdate
* Inspection
* InspectionItem
* ConstructionProject
* ProjectPhase
* ProjectMilestone
* ProjectTask
* SiteReport
* BOQ
* BOQItem
* Supplier
* Contractor
* PurchaseRequest
* PurchaseRequestItem
* SupplierQuotation
* PurchaseOrder
* GoodsReceivedNote
* InventoryItem
* Warehouse
* StockTransaction
* Equipment
* Expense
* Approval
* Document
* Notification
* AuditLog
* CompanySetting

Use enums where appropriate, but avoid excessive enums where administrator-managed database tables are more flexible.

Add:

* Created-at timestamps
* Updated-at timestamps
* Created-by fields where useful
* Soft deletion for important business records
* Database indexes
* Unique constraints
* Referential integrity
* Transaction-safe financial operations

## Required application routes

Create routes similar to:

Public:

* `/`
* `/about`
* `/services`
* `/services/construction`
* `/services/real-estate`
* `/services/property-management`
* `/properties`
* `/properties/[slug]`
* `/projects`
* `/projects/[slug]`
* `/news`
* `/contact`
* `/request-quote`
* `/book-viewing`

Authentication:

* `/login`
* `/forgot-password`
* `/reset-password`

Internal:

* `/dashboard`
* `/dashboard/leads`
* `/dashboard/clients`
* `/dashboard/properties`
* `/dashboard/properties/new`
* `/dashboard/units`
* `/dashboard/tenants`
* `/dashboard/leases`
* `/dashboard/rent`
* `/dashboard/payments`
* `/dashboard/maintenance`
* `/dashboard/inspections`
* `/dashboard/projects`
* `/dashboard/projects/[id]`
* `/dashboard/procurement`
* `/dashboard/inventory`
* `/dashboard/equipment`
* `/dashboard/suppliers`
* `/dashboard/contractors`
* `/dashboard/employees`
* `/dashboard/documents`
* `/dashboard/reports`
* `/dashboard/settings`

Portal:

* `/portal/tenant`
* `/portal/owner`
* `/portal/buyer`

## UI requirements

Create a consistent design system.

Use:

* Clear typography
* Good spacing
* Accessible forms
* Loading skeletons
* Empty states
* Confirmation dialogs
* Success and error notifications
* Pagination
* Search
* Sorting
* Filtering
* Responsive tables
* Mobile-friendly forms
* Status badges
* Breadcrumb navigation
* Reusable form components

Do not overuse gradients, animations or decorative elements.

The public website should look premium and visually impressive.

The employee dashboard should prioritise speed, clarity and usability.

## Security requirements

Implement:

* Server-side authorization
* Input validation
* Secure password handling
* CSRF protection where applicable
* Rate limiting for public forms and authentication
* Secure file-upload validation
* Protection against IDOR vulnerabilities
* Sanitisation of user-generated content
* Safe error handling
* Database transaction handling
* Audit logging
* Environment-variable validation

Never expose sensitive financial, employee, tenant or property-owner information through public API responses.

## Seed data

Create a seed script containing realistic sample data for Uganda, including:

* One super administrator
* One managing director
* Several employees with different roles
* Property owners
* Tenants
* Buyers
* Suppliers
* Contractors
* Properties in Kampala, Entebbe, Wakiso and Jinja
* Rental units
* Active leases
* Rent invoices
* Payments
* Maintenance requests
* Construction projects
* Project tasks
* Purchase requests
* Inventory items
* Dashboard notifications

Clearly document sample login credentials in the README for local development only.

## Testing

Add tests for critical functionality:

* Authentication
* Authorization
* Property creation
* Lead submission
* Lease creation
* Rent invoice generation
* Payment allocation
* Maintenance-request submission
* Approval workflow

Use unit and integration tests where practical.

## Development workflow

Do not attempt to generate the entire system in one uncontrolled step.

Work through these stages:

### Stage 1: Planning

Before writing code:

1. Inspect the current repository.
2. Produce the proposed folder structure.
3. Produce the core database relationship plan.
4. Identify assumptions.
5. Create an implementation checklist.
6. Save the checklist in `IMPLEMENTATION_PLAN.md`.

Do not stop after planning. Continue with the implementation.

### Stage 2: Foundation

Build:

* Project setup
* Database connection
* Prisma schema
* Authentication
* Role-based permissions
* Dashboard layout
* Public layout
* Reusable UI components
* Seed data
* Environment validation

### Stage 3: MVP modules

Build complete working versions of:

1. Public website
2. Property listings
3. CRM leads
4. Property and unit management
5. Tenant management
6. Lease management
7. Rent invoices and payment records
8. Maintenance requests
9. Basic construction-project management
10. Document uploads
11. Executive dashboard
12. Administration settings

### Stage 4: Operational modules

Add:

* Site reports
* BOQ management
* Procurement
* Inventory
* Equipment
* Property inspections
* Owner statements
* Human resources
* Advanced reports

### Stage 5: Quality assurance

After implementation:

1. Run the TypeScript compiler.
2. Run linting.
3. Run tests.
4. Run the production build.
5. Fix all errors.
6. Check mobile responsiveness.
7. Check permissions using different user roles.
8. Review database queries for security and performance.
9. Update the README.

Do not claim that the application is complete while TypeScript, linting or build errors remain.

## Coding standards

* Use strict TypeScript.
* Avoid `any`.
* Create small reusable components.
* Separate database logic from presentation components.
* Use server components by default.
* Use client components only when interactivity requires them.
* Avoid duplicating business logic.
* Use database transactions for payment and stock operations.
* Add meaningful error messages.
* Add comments only where the logic is not self-explanatory.
* Use consistent naming.
* Keep files manageable.
* Create reusable permission-checking utilities.
* Create reusable currency, date and status-formatting utilities.

## Deliverables

The finished repository must include:

* Functional Next.js application
* Prisma schema
* Database migrations
* Seed script
* Authentication
* Role-based authorization
* Public website
* Employee dashboard
* Tenant portal
* Property-owner portal
* Core business modules
* Responsive design
* Sample data
* Tests
* `.env.example`
* `README.md`
* `IMPLEMENTATION_PLAN.md`
* Setup instructions
* Deployment instructions
* Known limitations
* Recommended next features

## Final instruction

Begin by inspecting the repository and creating `IMPLEMENTATION_PLAN.md`.

Then immediately implement the foundation and MVP.

When making assumptions, choose sensible defaults and document them instead of repeatedly asking questions.

Prioritise working business workflows, database integrity, security and maintainability over decorative features.

At the end of every development stage:

* Summarise what was completed.
* List the main files created or changed.
* Run the relevant checks.
* Fix identified errors.
* Update the implementation checklist.
* Continue to the next unfinished task.
