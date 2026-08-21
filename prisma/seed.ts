import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import {
  ACTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  RESOURCES,
  ROLE_SLUGS,
} from "../src/lib/permissions";

const db = new PrismaClient();

const ROLE_DEFS = [
  { name: "Super Administrator", slug: ROLE_SLUGS.SUPER_ADMIN },
  { name: "Managing Director", slug: ROLE_SLUGS.MANAGING_DIRECTOR },
  { name: "Operations Manager", slug: ROLE_SLUGS.OPERATIONS_MANAGER },
  { name: "Project Manager", slug: ROLE_SLUGS.PROJECT_MANAGER },
  { name: "Site Engineer", slug: ROLE_SLUGS.SITE_ENGINEER },
  { name: "Quantity Surveyor", slug: ROLE_SLUGS.QUANTITY_SURVEYOR },
  { name: "Property Manager", slug: ROLE_SLUGS.PROPERTY_MANAGER },
  { name: "Sales Manager", slug: ROLE_SLUGS.SALES_MANAGER },
  { name: "Sales Agent", slug: ROLE_SLUGS.SALES_AGENT },
  { name: "Procurement Officer", slug: ROLE_SLUGS.PROCUREMENT_OFFICER },
  { name: "Storekeeper", slug: ROLE_SLUGS.STOREKEEPER },
  { name: "Accountant", slug: ROLE_SLUGS.ACCOUNTANT },
  { name: "Human Resource Officer", slug: ROLE_SLUGS.HR_OFFICER },
  { name: "Maintenance Officer", slug: ROLE_SLUGS.MAINTENANCE_OFFICER },
  { name: "Technician", slug: ROLE_SLUGS.TECHNICIAN },
  { name: "Receptionist", slug: ROLE_SLUGS.RECEPTIONIST },
  { name: "Property Owner", slug: ROLE_SLUGS.PROPERTY_OWNER },
  { name: "Tenant", slug: ROLE_SLUGS.TENANT },
  { name: "Buyer", slug: ROLE_SLUGS.BUYER },
  { name: "Supplier", slug: ROLE_SLUGS.SUPPLIER },
  { name: "Contractor", slug: ROLE_SLUGS.CONTRACTOR },
];

async function main() {
  console.log("Seeding JK Express database...");

  // Permissions
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      await db.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: {
          resource,
          action,
          description: `${action} ${resource}`,
        },
      });
    }
  }

  const allPermissions = await db.permission.findMany();
  const permMap = new Map(
    allPermissions.map((p) => [`${p.resource}:${p.action}`, p.id]),
  );

  // Roles + role permissions
  for (const role of ROLE_DEFS) {
    const created = await db.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name },
      create: {
        name: role.name,
        slug: role.slug,
        isSystem: true,
        description: role.name,
      },
    });

    const desired = DEFAULT_ROLE_PERMISSIONS[role.slug] ?? [];
    for (const { resource, action } of desired) {
      const permissionId = permMap.get(`${resource}:${action}`);
      if (!permissionId) continue;
      await db.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: created.id, permissionId },
        },
        update: {},
        create: { roleId: created.id, permissionId },
      });
    }
  }

  const roles = await db.role.findMany();
  const roleBySlug = Object.fromEntries(roles.map((r) => [r.slug, r]));

  const passwordHash = await hash("Password123!", 10);

  async function ensureUser(
    email: string,
    name: string,
    roleSlug: string,
    phone?: string,
  ) {
    return db.user.upsert({
      where: { email },
      update: { name, roleId: roleBySlug[roleSlug].id, isActive: true },
      create: {
        email,
        name,
        phone,
        passwordHash,
        emailVerified: new Date(),
        roleId: roleBySlug[roleSlug].id,
      },
    });
  }

  const admin = await ensureUser(
    "admin@jkexpress.ug",
    "System Admin",
    ROLE_SLUGS.SUPER_ADMIN,
    "+256700000001",
  );
  const md = await ensureUser(
    "md@jkexpress.ug",
    "Grace Nakato",
    ROLE_SLUGS.MANAGING_DIRECTOR,
    "+256700000002",
  );
  const propMgr = await ensureUser(
    "property@jkexpress.ug",
    "James Okello",
    ROLE_SLUGS.PROPERTY_MANAGER,
    "+256700000003",
  );
  const sales = await ensureUser(
    "sales@jkexpress.ug",
    "Sarah Namuli",
    ROLE_SLUGS.SALES_AGENT,
    "+256700000004",
  );
  const pm = await ensureUser(
    "projects@jkexpress.ug",
    "David Mugisha",
    ROLE_SLUGS.PROJECT_MANAGER,
    "+256700000005",
  );
  const accountant = await ensureUser(
    "finance@jkexpress.ug",
    "Amina Hassan",
    ROLE_SLUGS.ACCOUNTANT,
    "+256700000006",
  );
  const maintenance = await ensureUser(
    "maintenance@jkexpress.ug",
    "Peter Ssemakula",
    ROLE_SLUGS.MAINTENANCE_OFFICER,
    "+256700000007",
  );
  const tenantUser = await ensureUser(
    "tenant@example.com",
    "John Kato",
    ROLE_SLUGS.TENANT,
    "+256700000101",
  );
  const ownerUser = await ensureUser(
    "owner@example.com",
    "Mary Nalubega",
    ROLE_SLUGS.PROPERTY_OWNER,
    "+256700000102",
  );

  await db.companySetting.upsert({
    where: { id: "default" },
    update: {
      primaryColor: "#002090",
      secondaryColor: "#E80000",
      logoUrl: "/logo.png",
      phone: "0704 776 059 | 0786 953 313",
      whatsapp: "+256704776059",
      tagline:
        "Building Construction & Consultancy · Real Estate & Property Management",
    },
    create: {
      id: "default",
      companyName: "JK Express",
      tagline:
        "Building Construction & Consultancy · Real Estate & Property Management",
      description:
        "JK Express Realtors & Developers Ltd. delivers construction, real estate and property management services across Uganda and East Africa.",
      email: "info@jkexpress.ug",
      phone: "0704 776 059 | 0786 953 313",
      whatsapp: "+256704776059",
      address: "Plot 12, Kampala Road",
      city: "Kampala",
      country: "Uganda",
      defaultCurrency: "UGX",
      secondaryCurrency: "USD",
      timezone: "Africa/Kampala",
      primaryColor: "#002090",
      secondaryColor: "#E80000",
      logoUrl: "/logo.png",
    },
  });

  const depts = ["Operations", "Construction", "Property Management", "Sales", "Finance", "HR"];
  for (const name of depts) {
    await db.department.upsert({
      where: { name },
      update: {},
      create: { name, code: name.slice(0, 3).toUpperCase() },
    });
  }
  const constructionDept = await db.department.findUnique({
    where: { name: "Construction" },
  });

  await db.employee.upsert({
    where: { userId: pm.id },
    update: {},
    create: {
      userId: pm.id,
      employeeCode: "EMP-001",
      departmentId: constructionDept?.id,
      jobTitle: "Project Manager",
      employmentStatus: "ACTIVE",
      hireDate: new Date("2022-03-01"),
    },
  });
  await db.employee.upsert({
    where: { userId: propMgr.id },
    update: {},
    create: {
      userId: propMgr.id,
      employeeCode: "EMP-002",
      jobTitle: "Property Manager",
      employmentStatus: "ACTIVE",
      hireDate: new Date("2021-06-15"),
    },
  });
  await db.employee.upsert({
    where: { userId: md.id },
    update: {},
    create: {
      userId: md.id,
      employeeCode: "EMP-003",
      jobTitle: "Managing Director",
      employmentStatus: "ACTIVE",
      hireDate: new Date("2019-01-10"),
    },
  });

  const owner = await db.propertyOwner.upsert({
    where: { userId: ownerUser.id },
    update: {},
    create: {
      userId: ownerUser.id,
      firstName: "Mary",
      lastName: "Nalubega",
      email: "owner@example.com",
      phone: "+256700000102",
      company: "Nalubega Holdings",
      address: "Kololo, Kampala",
    },
  });

  const owner2 = await db.propertyOwner.create({
    data: {
      firstName: "Robert",
      lastName: "Muwonge",
      email: "robert@example.com",
      phone: "+256700000103",
      address: "Entebbe",
    },
  });

  // Listing photos from /public/site-photos
  const PROPERTY_IMAGES: Record<string, string> = {
    "kololo-executive-apartment": "/site-photos/site-04.jpeg",
    "naguru-family-house": "/site-photos/site-03.jpeg",
    "entebbe-lakefront-villa": "/site-photos/site-07.jpeg",
    "wakiso-commercial-shop": "/site-photos/site-08.jpeg",
    "jinja-riverside-plot": "/site-photos/site-09.jpeg",
    "bugolobi-serviced-apartments": "/site-photos/site-02.jpeg",
  };

  // Properties across Uganda cities
  const propertyDefs = [
    {
      reference: "PROP-KLA-001",
      slug: "kololo-executive-apartment",
      title: "Kololo Executive 3-Bedroom Apartment",
      description:
        "Premium furnished apartment in Kololo with modern finishes, secure parking and 24-hour security. Ideal for executives and expatriates.",
      propertyType: "APARTMENT",
      listingType: "RENT",
      city: "Kampala",
      district: "Kampala",
      address: "Upper Kololo Terrace",
      price: 3500000,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      propertySize: 180,
      furnishingStatus: "FURNISHED",
      status: "AVAILABLE",
      isFeatured: true,
      ownerId: owner.id,
      amenities: ["Parking", "Security", "Generator", "Wi-Fi", "Balcony"],
    },
    {
      reference: "PROP-KLA-002",
      slug: "naguru-family-house",
      title: "Naguru Family House for Sale",
      description:
        "Spacious 4-bedroom house in Naguru with garden, staff quarters and perimeter wall.",
      propertyType: "HOUSE",
      listingType: "SALE",
      city: "Kampala",
      district: "Kampala",
      address: "Naguru Hill",
      price: 850000000,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 3,
      landSize: 0.25,
      furnishingStatus: "UNFURNISHED",
      status: "AVAILABLE",
      isFeatured: true,
      ownerId: owner2.id,
      amenities: ["Garden", "Staff quarters", "Parking", "Water tank"],
    },
    {
      reference: "PROP-EBB-001",
      slug: "entebbe-lakefront-villa",
      title: "Entebbe Lakefront Villa",
      description:
        "Stunning villa near Lake Victoria with private garden and modern kitchen.",
      propertyType: "HOUSE",
      listingType: "SALE",
      city: "Entebbe",
      district: "Wakiso",
      address: "Nakiwogo Road",
      price: 1200000000,
      bedrooms: 5,
      bathrooms: 4,
      parkingSpaces: 4,
      landSize: 0.5,
      status: "AVAILABLE",
      isFeatured: true,
      ownerId: owner.id,
      amenities: ["Lake view", "Garden", "Security", "Borehole"],
    },
    {
      reference: "PROP-WKS-001",
      slug: "wakiso-commercial-shop",
      title: "Wakiso Commercial Shop Unit",
      description: "High-traffic commercial unit suitable for retail or services.",
      propertyType: "COMMERCIAL",
      listingType: "RENT",
      city: "Wakiso",
      district: "Wakiso",
      address: "Gayaza Road",
      price: 1200000,
      bedrooms: 0,
      bathrooms: 1,
      propertySize: 45,
      status: "AVAILABLE",
      isFeatured: false,
      ownerId: owner2.id,
      amenities: ["Parking", "Storage"],
    },
    {
      reference: "PROP-JJA-001",
      slug: "jinja-riverside-plot",
      title: "Jinja Riverside Land Plot",
      description: "Prime freehold land near the Nile, suitable for residential development.",
      propertyType: "LAND",
      listingType: "SALE",
      city: "Jinja",
      district: "Jinja",
      address: "Nile Crescent",
      price: 280000000,
      landSize: 1.2,
      status: "AVAILABLE",
      isFeatured: true,
      ownerId: owner.id,
      amenities: ["Road access", "Title available"],
    },
    {
      reference: "PROP-KLA-003",
      slug: "bugolobi-serviced-apartments",
      title: "Bugolobi Serviced Apartments Block",
      description:
        "Managed apartment block with 8 units. Strong rental demand in Bugolobi.",
      propertyType: "APARTMENT",
      listingType: "RENT",
      city: "Kampala",
      district: "Kampala",
      address: "Luthuli Avenue, Bugolobi",
      price: 1800000,
      bedrooms: 2,
      bathrooms: 1,
      propertySize: 95,
      status: "AVAILABLE",
      isFeatured: true,
      ownerId: owner.id,
      amenities: ["Parking", "Security", "Backup power", "Water"],
    },
  ];

  const properties = [];
  for (const def of propertyDefs) {
    const { amenities, ...data } = def;
    const imageUrl = PROPERTY_IMAGES[data.slug] ?? "/site-photos/site-01.jpeg";
    const prop = await db.property.upsert({
      where: { reference: data.reference },
      update: {
        title: data.title,
        price: data.price,
        status: data.status,
        isPublished: true,
        isFeatured: data.isFeatured,
        agentId: sales.id,
      },
      create: {
        ...data,
        country: "Uganda",
        currency: "UGX",
        isPublished: true,
        listedAt: new Date(),
        agentId: sales.id,
        images: {
          create: [
            {
              url: imageUrl,
              alt: data.title,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        amenities: {
          create: amenities.map((name) => ({ name })),
        },
      },
    });

    // Keep primary image unique even when property already existed
    const existingPrimary = await db.propertyImage.findFirst({
      where: { propertyId: prop.id, isPrimary: true },
    });
    if (existingPrimary) {
      await db.propertyImage.update({
        where: { id: existingPrimary.id },
        data: { url: imageUrl, alt: data.title },
      });
    } else {
      await db.propertyImage.create({
        data: {
          propertyId: prop.id,
          url: imageUrl,
          alt: data.title,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    properties.push(prop);
  }

  const multiUnit = properties.find((p) => p.slug === "bugolobi-serviced-apartments")!;
  const building = await db.building.upsert({
    where: { id: "seed-building-1" },
    update: {},
    create: {
      id: "seed-building-1",
      propertyId: multiUnit.id,
      name: "Block A",
      floors: 4,
    },
  });

  const unitDefs = [
    { unitNumber: "A01", unitType: "2BR", bedrooms: 2, rent: 1800000, status: "OCCUPIED" },
    { unitNumber: "A02", unitType: "2BR", bedrooms: 2, rent: 1800000, status: "OCCUPIED" },
    { unitNumber: "A03", unitType: "1BR", bedrooms: 1, rent: 1200000, status: "VACANT" },
    { unitNumber: "A04", unitType: "2BR", bedrooms: 2, rent: 1850000, status: "VACANT" },
    { unitNumber: "A05", unitType: "STUDIO", bedrooms: 0, rent: 900000, status: "UNDER_MAINTENANCE" },
  ];

  const units = [];
  for (const u of unitDefs) {
    const unit = await db.unit.upsert({
      where: {
        propertyId_unitNumber: {
          propertyId: multiUnit.id,
          unitNumber: u.unitNumber,
        },
      },
      update: { status: u.status, monthlyRent: u.rent },
      create: {
        propertyId: multiUnit.id,
        buildingId: building.id,
        unitNumber: u.unitNumber,
        unitType: u.unitType,
        bedrooms: u.bedrooms,
        bathrooms: 1,
        monthlyRent: u.rent,
        serviceCharge: 100000,
        depositRequired: u.rent * 2,
        status: u.status,
        currency: "UGX",
      },
    });
    units.push(unit);
  }

  // Kololo unit for primary tenant lease
  const kololo = properties.find((p) => p.slug === "kololo-executive-apartment")!;
  const kololoUnit = await db.unit.upsert({
    where: {
      propertyId_unitNumber: { propertyId: kololo.id, unitNumber: "MAIN" },
    },
    update: { status: "OCCUPIED" },
    create: {
      propertyId: kololo.id,
      unitNumber: "MAIN",
      unitType: "3BR",
      bedrooms: 3,
      bathrooms: 2,
      monthlyRent: 3500000,
      serviceCharge: 200000,
      depositRequired: 7000000,
      status: "OCCUPIED",
      currency: "UGX",
    },
  });

  const tenant = await db.tenant.upsert({
    where: { userId: tenantUser.id },
    update: {},
    create: {
      userId: tenantUser.id,
      firstName: "John",
      lastName: "Kato",
      email: "tenant@example.com",
      phone: "+256700000101",
      idNumber: "CM90000123ABC",
      nationality: "Ugandan",
      address: "Kololo, Kampala",
      emergencyName: "Jane Kato",
      emergencyPhone: "+256700000199",
    },
  });

  const tenant2 = await db.tenant.create({
    data: {
      firstName: "Esther",
      lastName: "Achieng",
      email: "esther@example.com",
      phone: "+256700000104",
      nationality: "Ugandan",
    },
  });

  const leaseStart = new Date();
  leaseStart.setMonth(leaseStart.getMonth() - 3);
  const leaseEnd = new Date();
  leaseEnd.setMonth(leaseEnd.getMonth() + 9);

  const lease = await db.lease.upsert({
    where: { reference: "LSE-2025-001" },
    update: { status: "ACTIVE" },
    create: {
      reference: "LSE-2025-001",
      tenantId: tenant.id,
      propertyId: kololo.id,
      unitId: kololoUnit.id,
      startDate: leaseStart,
      endDate: leaseEnd,
      monthlyRent: 3500000,
      serviceCharge: 200000,
      deposit: 7000000,
      currency: "UGX",
      paymentDueDay: 1,
      gracePeriodDays: 5,
      status: "ACTIVE",
    },
  });

  const lease2End = new Date();
  lease2End.setDate(lease2End.getDate() + 45);
  await db.lease.upsert({
    where: { reference: "LSE-2025-002" },
    update: {},
    create: {
      reference: "LSE-2025-002",
      tenantId: tenant2.id,
      propertyId: multiUnit.id,
      unitId: units[0].id,
      startDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
      endDate: lease2End,
      monthlyRent: 1800000,
      serviceCharge: 100000,
      deposit: 3600000,
      currency: "UGX",
      status: "EXPIRING",
    },
  });

  await db.securityDeposit.create({
    data: {
      leaseId: lease.id,
      amount: 7000000,
      currency: "UGX",
      status: "HELD",
    },
  });

  // Invoices & payments
  for (let i = 0; i < 3; i++) {
    const issue = new Date();
    issue.setMonth(issue.getMonth() - (2 - i));
    issue.setDate(1);
    const due = new Date(issue);
    due.setDate(5);
    const total = 3700000;
    const paid = i < 2 ? total : 2000000;
    const inv = await db.invoice.upsert({
      where: { invoiceNumber: `INV-RENT-2025-00${i + 1}` },
      update: {},
      create: {
        invoiceNumber: `INV-RENT-2025-00${i + 1}`,
        type: "RENT",
        leaseId: lease.id,
        tenantId: tenant.id,
        issueDate: issue,
        dueDate: due,
        subtotal: total,
        totalAmount: total,
        amountPaid: paid,
        balance: total - paid,
        currency: "UGX",
        status: paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING",
        items: {
          create: [
            {
              description: "Monthly rent",
              quantity: 1,
              unitPrice: 3500000,
              amount: 3500000,
            },
            {
              description: "Service charge",
              quantity: 1,
              unitPrice: 200000,
              amount: 200000,
            },
          ],
        },
      },
    });

    if (paid > 0) {
      const payment = await db.payment.create({
        data: {
          paymentNumber: `PAY-2025-00${i + 1}`,
          amount: paid,
          currency: "UGX",
          method: i === 0 ? "BANK_TRANSFER" : "MOBILE_MONEY",
          paymentDate: due,
          tenantId: tenant.id,
          receivedBy: accountant.name ?? "Finance",
          status: "COMPLETED",
          allocations: {
            create: [{ invoiceId: inv.id, amount: paid }],
          },
          receipts: {
            create: {
              receiptNumber: `RCT-2025-00${i + 1}`,
            },
          },
        },
      });
      void payment;
    }
  }

  // Leads
  const leadSources = ["WEBSITE", "WHATSAPP", "REFERRAL", "WALK_IN"];
  const leadStages = ["NEW", "CONTACTED", "QUALIFIED", "VIEWING_SCHEDULED", "NEGOTIATION"];
  for (let i = 0; i < 8; i++) {
    await db.lead.create({
      data: {
        reference: `LD-2025-${String(i + 1).padStart(3, "0")}`,
        firstName: ["Alice", "Brian", "Christine", "Daniel", "Eva", "Frank", "Gloria", "Hassan"][i],
        lastName: ["Okello", "Tumusiime", "Nabirye", "Wasswa", "Auma", "Kizza", "Atim", "Ssebunya"][i],
        email: `lead${i + 1}@example.com`,
        phone: `+25670${1000000 + i}`,
        source: leadSources[i % leadSources.length],
        stage: leadStages[i % leadStages.length],
        interest: i % 2 === 0 ? "RENT" : "SALE",
        message: "Interested in viewing this property.",
        propertyId: properties[i % properties.length].id,
        assigneeId: sales.id,
        createdById: admin.id,
        activities: {
          create: {
            type: "NOTE",
            title: "Lead created",
            description: "Initial inquiry recorded.",
            userId: admin.id,
          },
        },
      },
    });
  }

  // Contacts / suppliers / contractors
  const supplierContact = await db.contact.create({
    data: {
      type: "SUPPLIER",
      firstName: "Steel",
      lastName: "Uganda Ltd",
      email: "sales@steelug.example",
      phone: "+256700200001",
      company: "Steel Uganda Ltd",
      city: "Kampala",
    },
  });
  await db.supplier.create({
    data: {
      contactId: supplierContact.id,
      name: "Steel Uganda Ltd",
      email: "sales@steelug.example",
      phone: "+256700200001",
      address: "Industrial Area, Kampala",
    },
  });

  await db.contractor.create({
    data: {
      name: "Nile Builders Co.",
      specialty: "Civil works",
      email: "ops@nilebuilders.example",
      phone: "+256700200002",
      address: "Jinja",
    },
  });

  // Construction projects
  const pmEmployee = await db.employee.findUnique({ where: { userId: pm.id } });
  const project = await db.constructionProject.upsert({
    where: { code: "PRJ-2025-001" },
    update: {
      featuredImage: "/site-photos/site-01.jpeg",
      isPublished: true,
    },
    create: {
      code: "PRJ-2025-001",
      slug: "kololo-office-complex",
      name: "Kololo Office Complex",
      description:
        "5-storey mixed-use office complex with basement parking in Kololo, Kampala.",
      clientName: "Horizon Investments Ltd",
      projectManagerId: pmEmployee?.id,
      location: "Kololo, Kampala",
      city: "Kampala",
      startDate: new Date("2025-01-15"),
      expectedCompletion: new Date("2026-12-31"),
      contractValue: 12500000000,
      approvedBudget: 11800000000,
      currentExpenditure: 4200000000,
      completionPercentage: 35,
      status: "ACTIVE",
      isPublished: true,
      featuredImage: "/site-photos/site-01.jpeg",
      phases: {
        create: [
          { name: "Foundation", sortOrder: 1, status: "COMPLETED" },
          { name: "Structure", sortOrder: 2, status: "IN_PROGRESS" },
          { name: "Finishes", sortOrder: 3, status: "NOT_STARTED" },
        ],
      },
      milestones: {
        create: [
          { name: "Foundation complete", status: "COMPLETED", completedAt: new Date("2025-06-01") },
          { name: "Roofing", status: "PENDING", dueDate: new Date("2026-03-01") },
          { name: "Handover", status: "PENDING", dueDate: new Date("2026-12-15") },
        ],
      },
    },
  });

  const portfolioProjects = [
    {
      code: "PRJ-2024-008",
      slug: "entebbe-residential-estate",
      name: "Entebbe Residential Estate Phase 1",
      description: "12-unit residential estate completed in Entebbe with landscaped courtyards and secure perimeter.",
      clientName: "JK Express Developments",
      location: "Entebbe Road corridor, Entebbe",
      city: "Entebbe",
      startDate: new Date("2023-04-01"),
      expectedCompletion: new Date("2024-11-30"),
      actualCompletion: new Date("2024-11-20"),
      contractValue: 4800000000,
      approvedBudget: 4500000000,
      currentExpenditure: 4450000000,
      completionPercentage: 100,
      status: "COMPLETED",
      featuredImage: "/site-photos/site-05.jpeg",
    },
    {
      code: "PRJ-2025-012",
      slug: "naguru-hillside-apartments",
      name: "Naguru Hillside Apartments",
      description:
        "4-storey apartment block with 16 units, panoramic hill views and basement services in Naguru, Kampala.",
      clientName: "Summit Homes Ltd",
      location: "Naguru, Kampala",
      city: "Kampala",
      startDate: new Date("2025-03-01"),
      expectedCompletion: new Date("2026-09-30"),
      actualCompletion: null as Date | null,
      contractValue: 7200000000,
      approvedBudget: 6900000000,
      currentExpenditure: 2800000000,
      completionPercentage: 48,
      status: "ACTIVE",
      featuredImage: "/site-photos/site-02.jpeg",
    },
    {
      code: "PRJ-2025-018",
      slug: "bugolobi-mixed-use-hub",
      name: "Bugolobi Mixed-Use Hub",
      description:
        "Ground-floor retail with upper-level offices and apartments along the Bugolobi commercial strip.",
      clientName: "Lakeside Property Group",
      location: "Bugolobi, Kampala",
      city: "Kampala",
      startDate: new Date("2025-02-10"),
      expectedCompletion: new Date("2027-01-31"),
      actualCompletion: null as Date | null,
      contractValue: 9800000000,
      approvedBudget: 9400000000,
      currentExpenditure: 2100000000,
      completionPercentage: 22,
      status: "ACTIVE",
      featuredImage: "/site-photos/site-08.jpeg",
    },
    {
      code: "PRJ-2024-021",
      slug: "muyenga-luxury-villas",
      name: "Muyenga Luxury Villas",
      description:
        "Six detached luxury villas with high finishes, compound parking and servant quarters in Muyenga.",
      clientName: "Private client consortium",
      location: "Muyenga, Kampala",
      city: "Kampala",
      startDate: new Date("2023-09-01"),
      expectedCompletion: new Date("2025-06-30"),
      actualCompletion: new Date("2025-06-12"),
      contractValue: 6100000000,
      approvedBudget: 5900000000,
      currentExpenditure: 5850000000,
      completionPercentage: 100,
      status: "COMPLETED",
      featuredImage: "/site-photos/site-03.jpeg",
    },
    {
      code: "PRJ-2025-027",
      slug: "jinja-riverside-commercial",
      name: "Jinja Riverside Commercial Block",
      description:
        "Three-storey commercial block near the Nile corridor with flexible retail shells and first-floor offices.",
      clientName: "Eastern Trade Holdings",
      location: "Main Street corridor, Jinja",
      city: "Jinja",
      startDate: new Date("2025-05-01"),
      expectedCompletion: new Date("2026-08-15"),
      actualCompletion: null as Date | null,
      contractValue: 3500000000,
      approvedBudget: 3300000000,
      currentExpenditure: 900000000,
      completionPercentage: 28,
      status: "ACTIVE",
      featuredImage: "/site-photos/site-07.jpeg",
    },
  ] as const;

  for (const item of portfolioProjects) {
    await db.constructionProject.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        clientName: item.clientName,
        location: item.location,
        city: item.city,
        startDate: item.startDate,
        expectedCompletion: item.expectedCompletion,
        actualCompletion: item.actualCompletion,
        contractValue: item.contractValue,
        approvedBudget: item.approvedBudget,
        currentExpenditure: item.currentExpenditure,
        completionPercentage: item.completionPercentage,
        status: item.status,
        isPublished: true,
        featuredImage: item.featuredImage,
      },
      create: {
        code: item.code,
        slug: item.slug,
        name: item.name,
        description: item.description,
        clientName: item.clientName,
        location: item.location,
        city: item.city,
        startDate: item.startDate,
        expectedCompletion: item.expectedCompletion,
        actualCompletion: item.actualCompletion,
        contractValue: item.contractValue,
        approvedBudget: item.approvedBudget,
        currentExpenditure: item.currentExpenditure,
        completionPercentage: item.completionPercentage,
        status: item.status,
        isPublished: true,
        featuredImage: item.featuredImage,
      },
    });
  }

  const structurePhase = await db.projectPhase.findFirst({
    where: { projectId: project.id, name: "Structure" },
  });

  await db.projectTask.createMany({
    data: [
      {
        projectId: project.id,
        phaseId: structurePhase?.id,
        title: "Pour second floor slab",
        assigneeId: pm.id,
        createdById: pm.id,
        priority: "HIGH",
        status: "IN_PROGRESS",
        completionPercentage: 60,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project.id,
        title: "Order steel reinforcement",
        assigneeId: pm.id,
        createdById: pm.id,
        priority: "URGENT",
        status: "COMPLETED",
        completionPercentage: 100,
      },
      {
        projectId: project.id,
        title: "Safety audit",
        assigneeId: pm.id,
        createdById: admin.id,
        priority: "MEDIUM",
        status: "NOT_STARTED",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await db.siteReport.create({
    data: {
      projectId: project.id,
      reportDate: new Date(),
      submittedById: pm.id,
      weather: "Sunny",
      workersPresent: 42,
      contractorsPresent: 3,
      workCompleted: "Column formwork for level 2 completed on east wing.",
      materialsReceived: "20 tons cement, 5 tons rebar",
      materialsConsumed: "8 tons cement",
      safetyObservations: "All workers wearing PPE.",
      nextDayPlan: "Begin slab pour preparation.",
      status: "SUBMITTED",
    },
  });

  // Maintenance
  await db.maintenanceTicket.create({
    data: {
      ticketNumber: "MT-2025-001",
      propertyId: multiUnit.id,
      unitId: units[4].id,
      category: "PLUMBING",
      title: "Leaking kitchen sink",
      description: "Persistent leak under kitchen sink in unit A05.",
      priority: "HIGH",
      status: "ASSIGNED",
      assigneeId: maintenance.id,
      estimatedCost: 150000,
    },
  });
  await db.maintenanceTicket.create({
    data: {
      ticketNumber: "MT-2025-002",
      propertyId: kololo.id,
      unitId: kololoUnit.id,
      tenantId: tenant.id,
      category: "ELECTRICAL",
      title: "Intermittent power socket",
      description: "Living room socket fails intermittently.",
      priority: "NORMAL",
      status: "REPORTED",
    },
  });

  // Inventory
  const warehouse = await db.warehouse.upsert({
    where: { code: "WH-MAIN" },
    update: {},
    create: {
      name: "Main Store - Kampala",
      code: "WH-MAIN",
      location: "Industrial Area",
    },
  });

  await db.inventoryItem.createMany({
    data: [
      {
        sku: "CEM-42.5-50",
        name: "Cement 42.5 (50kg)",
        category: "MATERIALS",
        unit: "bag",
        quantityOnHand: 120,
        reorderLevel: 50,
        unitCost: 38000,
        warehouseId: warehouse.id,
      },
      {
        sku: "REBAR-Y12",
        name: "Y12 Reinforcement Bar",
        category: "MATERIALS",
        unit: "piece",
        quantityOnHand: 30,
        reorderLevel: 40,
        unitCost: 45000,
        warehouseId: warehouse.id,
      },
      {
        sku: "PPE-HELMET",
        name: "Safety Helmet",
        category: "SAFETY",
        unit: "pcs",
        quantityOnHand: 25,
        reorderLevel: 10,
        unitCost: 35000,
        warehouseId: warehouse.id,
      },
    ],
  });

  await db.equipment.createMany({
    data: [
      {
        code: "EQ-MIX-01",
        name: "Concrete Mixer 350L",
        category: "MACHINERY",
        condition: "GOOD",
        currentLocation: "Kololo site",
        nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        code: "EQ-GEN-02",
        name: "Diesel Generator 50kVA",
        category: "MACHINERY",
        condition: "FAIR",
        currentLocation: "Main store",
      },
    ],
  });

  // Procurement
  await db.purchaseRequest.create({
    data: {
      requestNumber: "PR-2025-001",
      requesterId: pm.id,
      projectId: project.id,
      title: "Steel for level 2",
      justification: "Required for ongoing structure phase.",
      status: "SUBMITTED",
      items: {
        create: [
          {
            description: "Y16 rebar",
            quantity: 200,
            unit: "piece",
            estimatedUnitCost: 65000,
          },
        ],
      },
    },
  });

  // Content — news (upsert so re-seeds stay clean)
  const newsSeed = [
    {
      slug: "kampala-property-outlook-2025",
      title: "Kampala Property Market Outlook 2025",
      excerpt:
        "Key trends shaping residential and commercial real estate across Kampala’s growth corridors.",
      content:
        "Kampala continues to attract strong demand for quality residential units, mixed-use developments and professionally managed assets.\n\nJK Express is expanding its construction and property management portfolio across Kololo, Bugolobi, Naguru and the Entebbe corridor.",
      coverImage: "/site-photos/site-08.jpeg",
      publishedAt: new Date("2025-11-12"),
    },
    {
      slug: "safety-first-on-site",
      title: "Safety First: Our Site Standards",
      excerpt:
        "How JK Express protects workers, neighbours and clients on every active construction site.",
      content:
        "Every JK Express site follows mandatory PPE, daily toolbox talks, controlled access and incident reporting with corrective actions tracked.",
      coverImage: "/site-photos/site-14.jpeg",
      publishedAt: new Date("2025-09-03"),
    },
    {
      slug: "why-professional-property-management-matters",
      title: "Why Professional Property Management Matters",
      excerpt:
        "Occupancy, collections and maintenance determine real returns — not just purchase price.",
      content:
        "Professional property management covers tenant sourcing, rent collection, maintenance and transparent owner reporting so assets actually perform.",
      coverImage: "/site-photos/site-05.jpeg",
      publishedAt: new Date("2026-01-20"),
    },
    {
      slug: "from-structure-to-handover-our-delivery-approach",
      title: "From Structure to Handover: Our Delivery Approach",
      excerpt:
        "How we move projects from foundation through finishes with milestone accountability.",
      content:
        "JK Express structures delivery around design clarity, phase gates, cost control and quality checks before handover packages are closed.",
      coverImage: "/site-photos/site-01.jpeg",
      publishedAt: new Date("2026-03-08"),
    },
    {
      slug: "entebbe-and-jinja-corridors-to-watch",
      title: "Entebbe & Jinja: Corridors to Watch",
      excerpt:
        "Beyond central Kampala, airport and Nile-linked markets continue to offer selective opportunity.",
      content:
        "Entebbe benefits from airport access and residential estate demand. Jinja remains Eastern Uganda’s commercial anchor along the Nile corridor.",
      coverImage: "/site-photos/site-07.jpeg",
      publishedAt: new Date("2026-05-15"),
    },
    {
      slug: "booking-a-site-visit-what-to-expect",
      title: "Booking a Site Visit: What to Expect",
      excerpt:
        "A short guide for clients who want to walk an active JK Express construction site.",
      content:
        "Site visits are typically available Monday–Saturday, 8:00 AM – 5:00 PM. Book via the website or WhatsApp with the project name.",
      coverImage: "/site-photos/site-02.jpeg",
      publishedAt: new Date("2026-06-02"),
    },
  ] as const;

  for (const article of newsSeed) {
    await db.newsArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        isPublished: true,
        publishedAt: article.publishedAt,
      },
      create: {
        ...article,
        isPublished: true,
      },
    });
  }

  await db.testimonial.createMany({
    data: [
      {
        name: "Michael Ssenyonjo",
        role: "Property Investor",
        company: "MSS Holdings",
        content:
          "JK Express manages our Bugolobi units professionally. Occupancy stays high and reporting is clear.",
        rating: 5,
        sortOrder: 1,
      },
      {
        name: "Helen Achieng",
        role: "Homeowner",
        content:
          "From foundation to finishes, their project team delivered on time and within budget.",
        rating: 5,
        sortOrder: 2,
      },
    ],
  });

  await db.jobPosting.create({
    data: {
      title: "Site Engineer",
      department: "Construction",
      location: "Kampala",
      type: "FULL_TIME",
      description:
        "We are hiring a Site Engineer to support active construction projects in Kampala. Civil engineering degree preferred.",
      isActive: true,
    },
  });

  // Notifications
  await db.notification.createMany({
    data: [
      {
        userId: propMgr.id,
        type: "LEASE_EXPIRY",
        title: "Lease expiring soon",
        message: "Lease LSE-2025-002 expires in under 60 days.",
        link: "/dashboard/leases",
      },
      {
        userId: maintenance.id,
        type: "MAINTENANCE_ASSIGNMENT",
        title: "New maintenance assignment",
        message: "Ticket MT-2025-001 has been assigned to you.",
        link: "/dashboard/maintenance",
      },
      {
        userId: sales.id,
        type: "NEW_LEAD",
        title: "New website lead",
        message: "A new lead was submitted from the website.",
        link: "/dashboard/leads",
      },
      {
        userId: admin.id,
        type: "LOW_STOCK",
        title: "Low stock alert",
        message: "Y12 Reinforcement Bar is below reorder level.",
        link: "/dashboard/inventory",
      },
    ],
  });

  await db.viewing.create({
    data: {
      propertyId: properties[1].id,
      clientName: "Alice Okello",
      clientEmail: "lead1@example.com",
      clientPhone: "+256701000000",
      agentId: sales.id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "SCHEDULED",
    },
  });

  console.log("Seed complete.");
  console.log("\nSample logins (password for all: Password123!):");
  console.log("  admin@jkexpress.ug          — Super Administrator");
  console.log("  md@jkexpress.ug             — Managing Director");
  console.log("  property@jkexpress.ug       — Property Manager");
  console.log("  sales@jkexpress.ug          — Sales Agent");
  console.log("  projects@jkexpress.ug       — Project Manager");
  console.log("  finance@jkexpress.ug        — Accountant");
  console.log("  maintenance@jkexpress.ug    — Maintenance Officer");
  console.log("  tenant@example.com          — Tenant portal");
  console.log("  owner@example.com           — Owner portal");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
