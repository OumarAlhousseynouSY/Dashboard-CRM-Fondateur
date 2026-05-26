## Why

The founder needs a secure, local-first CRM dashboard to monitor sales performance from a weekly CSV export — there is currently no tool to aggregate pipeline data, compute weighted forecasts, or compare salesperson efficiency. The MVP delivers immediate value on Day 1 with the minimum set of features required to replace manual spreadsheet analysis.

## What Changes

- Bootstrap a Next.js 14 App Router project with TypeScript, Prisma (SQLite), NextAuth.js, shadcn/ui, Tremor, and Tailwind CSS
- Implement single-admin credentials-based authentication with route protection via Next.js middleware
- Build a drag-and-drop CSV import module using Papa Parse + iconv-lite (latin-1 → UTF-8) with a truncate-and-reload strategy
- Implement the Prisma schema (`User`, `Deal`, `DealTag`) and seed script for the admin account
- Build the global KPI dashboard page: CA Sécurisé, Pipeline Brut, Pipeline Pondéré (10/35/70%), volume deals actifs, panier moyen, section "À relancer"
- Build the Commerciaux view: volume and gross value per salesperson (assignee)
- Build the Secteurs view: top sectors by value using exploded multi-tag parsing (split on `|`)

## Capabilities

### New Capabilities
- `auth`: Credentials-based login for a single admin user, JWT session, route protection via middleware
- `csv-import`: Drag-and-drop CSV upload, iconv-lite encoding fix, Papa Parse parsing, truncate-and-load server action
- `kpi-dashboard`: Global financial KPI cards and metrics computed via Prisma aggregations
- `sales-view`: Per-salesperson deal volume and gross portfolio value table
- `sector-view`: Top sectors by secured revenue + pipeline, based on exploded DealTag join

### Modified Capabilities
<!-- None — this is the initial project bootstrap, no existing specs to modify -->

## Impact

- **New project**: entire `crm-dashboard/` directory scaffolded from scratch
- **Dependencies added**: next, react, typescript, prisma, @prisma/client, next-auth, bcryptjs, papaparse, iconv-lite, tailwindcss, shadcn/ui, @tremor/react, recharts
- **Database**: SQLite file at `prisma/crm.db` (gitignored); schema migrations via `prisma migrate dev`
- **Environment variables**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (see `.env.example`)
- **No external APIs**: fully local, no third-party integrations
