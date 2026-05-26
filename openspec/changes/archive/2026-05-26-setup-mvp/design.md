## Context

This is a greenfield project — no existing codebase. The founder exports a CSV weekly from an external CRM tool and needs a local Mac application to analyse commercial performance without any cloud infrastructure. All data is ephemeral per import (truncate-and-load). The application must be secure (login required), fast to load, and maintainable by a single developer.

## Goals / Non-Goals

**Goals:**
- Bootstrap a production-ready Next.js 14 App Router monorepo with TypeScript, Prisma (SQLite), NextAuth.js, shadcn/ui, Tremor, Tailwind CSS
- Implement all MVP features: auth, CSV import, KPI dashboard, commerciaux view, secteurs view
- Keep the data model simple and the import pipeline deterministic (no partial states)

**Non-Goals:**
- Multi-user support or role-based access control
- Real-time sync or external API integration
- CSV merge/diff strategy (deferred to V3)
- PDF export, alertes, simulateur (deferred to V2)
- Deployment to any server (local Mac only for MVP)

## Decisions

### D1 — SQLite via Prisma (not PostgreSQL)
**Chosen**: SQLite file at `prisma/crm.db`
**Alternatives**: PostgreSQL (Docker), PlanetScale (cloud)
**Rationale**: The app is local-only on a Mac. SQLite requires zero infrastructure, starts instantly, and Prisma abstracts the SQL dialect if we ever migrate. The dataset (hundreds of deals per import) is well within SQLite's performance envelope.

### D2 — Truncate-and-load (not merge)
**Chosen**: `DELETE FROM DealTag; DELETE FROM Deal;` inside a transaction before each insert batch.
**Alternatives**: Upsert by deal ID, diff-based merge
**Rationale**: The CSV is the authoritative source of truth; the app has no independent mutations at this stage. Truncate eliminates deduplication logic entirely, making the import deterministic. Merge is planned for V3 when manual deal entry is added.

### D3 — NextAuth.js CredentialsProvider (not OAuth)
**Chosen**: Username/password with bcrypt (salt rounds 12), JWT session stored in httpOnly cookie.
**Alternatives**: Passkeys, magic link, OAuth (GitHub/Google)
**Rationale**: Single local user, no email server required, no external dependency. bcrypt at 12 rounds is adequate for a single-user app with no brute-force attack surface (localhost only).

### D4 — Papa Parse in the browser + Server Action (not server-side streaming)
**Chosen**: Client parses CSV to JSON array, then calls a Next.js Server Action with the array.
**Alternatives**: Stream multipart file upload to a server route and parse server-side
**Rationale**: Papa Parse handles encoding edge cases well client-side. Converting the ArrayBuffer via iconv-lite (latin-1 → UTF-8) in the browser avoids dealing with multipart streaming. Server Action simplifies the call and keeps the stack uniform.

### D5 — Multi-tag explosion via DealTag join table
**Chosen**: `tagsRaw` stored as-is on `Deal`; tags parsed into N `DealTag` rows per deal.
**Alternatives**: Store tags as a JSON array column, query with LIKE
**Rationale**: A normalised join table allows clean `GROUP BY tag` aggregations in Prisma without post-processing in JS. `@@index([tag])` ensures sector queries are fast even with 1 000+ deals.

### D6 — shadcn/ui + Tremor for components and charts
**Chosen**: shadcn/ui for base components (copied into `src/components/ui/`), Tremor for chart-ready KPI cards, Recharts under the hood.
**Alternatives**: MUI, Mantine, bare Recharts
**Rationale**: shadcn/ui is zero-runtime and fully customisable. Tremor's `Card`, `Metric`, and `BarChart` components map directly to the KPI and table layouts in the PRD with minimal custom styling.

## Risks / Trade-offs

- **Large CSV import latency**: Inserting 500+ deals in a single Server Action call may feel slow. → Mitigation: use `prisma.$transaction` with batched `createMany` (Prisma 5 supports SQLite `createMany`). Show a loading spinner during import.
- **iconv-lite in the browser**: iconv-lite is a Node.js library; the browser build via webpack/Next.js bundler may require polyfills or a custom encoding step. → Mitigation: test early; fallback to `TextDecoder('latin1')` native browser API if bundling fails.
- **SQLite write locking**: SQLite allows only one writer at a time. Concurrent imports (unlikely but possible) would fail. → Accepted risk at MVP; document as a known limitation.
- **bcrypt in a Server Action**: bcrypt is CPU-intensive; at 12 rounds it adds ~300ms to login. Acceptable for a local app with a single user.
- **No password change UI**: Admin must re-run the seed script to change their password until V1. → Documented in ARCHITECTURE.md; acceptable for MVP.

## Migration Plan

1. Run `npx create-next-app@latest crm-dashboard --typescript --tailwind --app` to scaffold
2. Install dependencies per ARCHITECTURE.md
3. Run `npx prisma migrate dev --name init` to create SQLite schema
4. Run `npx prisma db seed` to create the admin user
5. `npm run dev` — no data migration needed (no existing database)

**Rollback**: Delete `prisma/crm.db` and re-seed. No persistent state to preserve at MVP.

## Open Questions

- Should the KPI page auto-refresh after import redirect, or is a full page navigation sufficient? → Assumed: full navigation via `router.push('/') ` in the Server Action is sufficient.
- Exact column names in the CSV source file need to be confirmed against `crm_prospects_demo.csv`. → Must be verified during implementation of the import task.
