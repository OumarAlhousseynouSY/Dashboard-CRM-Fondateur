## 1. Project Bootstrap

- [x] 1.1 Scaffold Next.js 14 App Router project with TypeScript and Tailwind CSS (`npx create-next-app@latest crm-dashboard --typescript --tailwind --app`)
- [x] 1.2 Install core dependencies: `prisma`, `@prisma/client`, `next-auth`, `bcryptjs`, `@types/bcryptjs`
- [x] 1.3 Install UI/chart dependencies: `@tremor/react`, `recharts`, `papaparse`, `@types/papaparse`, `iconv-lite`
- [x] 1.4 Initialise shadcn/ui (`npx shadcn-ui@latest init`) and add required components: `button`, `card`, `input`, `label`, `toast`
- [x] 1.5 Configure `tailwind.config.ts` to include Tremor content paths
- [x] 1.6 Create `.env` and `.env.example` with `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

## 2. Database Schema & Seed

- [x] 2.1 Initialise Prisma (`npx prisma init --datasource-provider sqlite`)
- [x] 2.2 Write `prisma/schema.prisma` with `User`, `Deal`, and `DealTag` models as per ARCHITECTURE.md
- [x] 2.3 Run `npx prisma migrate dev --name init` to create `prisma/crm.db`
- [x] 2.4 Write `prisma/seed.ts` — upsert a single admin `User` with bcrypt-hashed password (salt rounds 12)
- [x] 2.5 Add `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }` to `package.json` and run `npx prisma db seed`
- [x] 2.6 Create `src/lib/db.ts` — Prisma Client singleton

## 3. Authentication

- [x] 3.1 Create `src/lib/auth.ts` — NextAuth.js config with `CredentialsProvider` and bcrypt password verification
- [x] 3.2 Create `src/app/api/auth/[...nextauth]/route.ts` — NextAuth API route handler
- [x] 3.3 Create `src/app/(auth)/login/page.tsx` — login form with email + password fields, error display, and redirect on success
- [x] 3.4 Create `middleware.ts` at project root — protect all `/(dashboard)` routes; redirect unauthenticated users to `/login`; redirect authenticated users away from `/login`

## 4. CSV Import

- [x] 4.1 Inspect `crm_prospects_demo.csv` to confirm exact column header names and map them to Prisma `Deal` fields
- [x] 4.2 Create `src/lib/csv.ts` — encoding conversion function (ArrayBuffer → string via `iconv-lite` latin-1, with `TextDecoder('latin1')` fallback) and status normalisation map
- [x] 4.3 Create `src/actions/import.ts` — Server Action: receive parsed rows array, run Prisma transaction (delete DealTag → delete Deal → createMany Deal + DealTag with multi-tag explosion), return result
- [x] 4.4 Create `src/app/(dashboard)/import/page.tsx` — drag-and-drop upload zone (React, no external library), reads file as ArrayBuffer, calls `csv.ts` for encoding + Papa Parse for parsing, calls the import Server Action, shows loading state and success/error toast

## 5. KPI Dashboard

- [x] 5.1 Create `src/lib/pipeline.ts` — `PIPELINE_WEIGHTS` constant and `computeKpis(deals)` function covering CA Sécurisé, Pipeline Brut, Pipeline Pondéré, volume deals actifs, panier moyen, and à-relancer aggregates
- [x] 5.2 Create `src/app/(dashboard)/page.tsx` — fetch all deals via Prisma server-side, compute KPIs, render Tremor `Card` + `Metric` components for each KPI, plus a dedicated "À relancer" section

## 6. Commerciaux View

- [x] 6.1 Create `src/app/(dashboard)/commerciaux/page.tsx` — Prisma `groupBy` on `assignee` to compute deal count and sum of amount; render a sortable table (by gross value desc) with columns: Nom, Nombre de deals, Valeur brute

## 7. Secteurs View

- [x] 7.1 Create `src/app/(dashboard)/secteurs/page.tsx` — Prisma query joining `DealTag` grouped by `tag` with sub-aggregations for CA Sécurisé and Pipeline; render table sorted by (CA Sécurisé + Pipeline) descending with columns: Secteur, CA Sécurisé, Pipeline

## 8. Layout & Navigation

- [x] 8.1 Create `src/app/(dashboard)/layout.tsx` — auth guard (redirect if no session), shared sidebar/navbar with links to `/` (KPIs), `/commerciaux`, `/secteurs`, `/import`
- [x] 8.2 Verify full navigation flow: login → dashboard → import → redirect back to dashboard with data
