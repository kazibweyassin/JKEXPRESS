# JK Express

Production-oriented web platform for **construction, real estate, and property management** in Uganda and East Africa.

The app includes:

1. **Public company website** — properties, projects, news, careers, inquiries  
2. **Employee workspace** — CRM, properties, leases, rent, maintenance, construction, procurement, inventory, HR, reports, admin  
3. **Tenant portal** — lease, invoices, payments, maintenance requests  
4. **Property-owner portal** — own assets, occupancy, expenses  

## Stack

- Next.js (App Router) + TypeScript  
- Tailwind CSS + custom UI components  
- Prisma ORM  
- Auth.js (NextAuth v5) credentials + JWT sessions  
- Zod validation  
- SQLite for local development (switch to PostgreSQL for production)

## Quick start

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Sample logins

Password for all demo users: **`Password123!`**

| Email | Role |
| --- | --- |
| admin@jkexpress.ug | Super Administrator |
| md@jkexpress.ug | Managing Director |
| property@jkexpress.ug | Property Manager |
| sales@jkexpress.ug | Sales Agent |
| projects@jkexpress.ug | Project Manager |
| finance@jkexpress.ug | Accountant |
| maintenance@jkexpress.ug | Maintenance Officer |
| tenant@example.com | Tenant portal |
| owner@example.com | Owner portal |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations (`prisma migrate deploy`) |
| `npm run db:migrate:dev` | Create a migration in development |
| `npm run db:push` | Push schema without a migration (dev only) |
| `npm run db:seed` | Seed sample Uganda data |
| `npm run db:setup` | Migrate + seed |

## Environment

See `.env.example`. Required:

- `DATABASE_URL` — PostgreSQL connection string  
  Local default: `postgresql://postgres:postgres@localhost:5432/jkexpress?schema=public`
- `AUTH_SECRET` / `NEXTAUTH_SECRET` — min 16 characters

Optional: object storage, Resend email keys (local mock storage is used by default).

## PostgreSQL (Prisma)

The app uses **Prisma + PostgreSQL** everywhere (local and Render).

**Local**

1. `docker compose up -d`
2. `cp .env.example .env`
3. `npm run db:setup`

**Render**

1. New → PostgreSQL (same region as the web service).
2. Copy the database **Internal Database URL** into the web service env var `DATABASE_URL`.
3. If connections fail, append `?sslmode=require`.
4. Start command: `npm start` (runs `prisma migrate deploy`, seeds if empty, then Next.js).

## Architecture

```
src/
  app/
    (public)/          # Marketing site
    (auth)/login       # Authentication
    dashboard/         # Internal workspace
    portal/            # Tenant / owner / buyer
    actions/           # Server actions
    api/auth/          # Auth.js route handlers
  components/          # UI + layouts + forms
  lib/                 # db, auth, permissions, utils
prisma/
  schema.prisma
  seed.ts
```

### Security model

- Roles and permissions are stored in the database.  
- Server actions and dashboard pages call `requirePagePermission` / `hasPermission`.  
- Middleware protects `/dashboard` and `/portal` routes.  
- Audit logs record logins and critical mutations.  
- Financial payment recording runs in a Prisma transaction.

## Known limitations (MVP)

- Live payment gateways (Flutterwave, MTN MoMo, etc.) are intentionally not wired — provider interfaces can be added later.  
- Document uploads use URL/metadata fields; full Cloudinary/S3 upload UI is scaffold-ready via env flags.  
- Advanced report CSV export and Excel BOQ import are planned next.  
- Email/SMS/WhatsApp are interface-level (in-app notifications work).  
- Some operational modules (full BOQ editor, multi-step procurement UI, attendance) are list/view first with data model ready for deeper workflows.

## Recommended next features

- Live mobile money / card integrations  
- Full double-entry accounting export  
- Excel BOQ import  
- Mobile app API surface  
- 2FA for staff accounts  
- Automated rent invoice generation cron  

## License

Private / proprietary — JK Express.
