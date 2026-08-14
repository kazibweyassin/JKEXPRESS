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
| `npm run db:push` | Sync Prisma schema |
| `npm run db:seed` | Seed sample Uganda data |
| `npm run db:setup` | Push schema + seed |

## Environment

See `.env.example`. Required:

- `DATABASE_URL` — local default `file:./dev.db`
- `AUTH_SECRET` / `NEXTAUTH_SECRET` — min 16 characters

Optional: object storage, Resend email keys (local mock storage is used by default).

## PostgreSQL (production)

1. Change `provider` in `prisma/schema.prisma` to `postgresql`.  
2. Set `DATABASE_URL` to your Postgres URL.  
3. Optionally use `docker-compose.yml` for a local Postgres container.  
4. Run `npm run db:setup`.

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
