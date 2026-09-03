# Glow Hub

Nigeria-based multi-vendor marketplace for beauty, fashion, and accessories, built around an escrow-on-dispatch payment model.

The full build spec is in [`docs/build-plan.md`](./docs/build-plan.md) — this repo is being built phase by phase from that document. **Phase 0 (project setup) is complete**; see the plan for what's next.

## Tech stack

- **Frontend/backend:** Next.js (App Router, TypeScript), mobile-first
- **Database:** PostgreSQL via Prisma
- **Cache/session:** Redis
- **Error logging:** Sentry
- Payments, SMS, email, and object storage providers are Phase 3–6 decisions — see `docs/build-plan.md` §1.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, REDIS_URL, etc.
npm run db:generate          # generate the Prisma client
npm run dev
```

You'll need a local PostgreSQL instance and Redis instance running (or point `.env.local` at hosted ones) for `db:generate`/`db:migrate` and the Redis client to connect.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Regenerate the Prisma client from `prisma/schema.prisma` |
| `npm run db:migrate` | Run Prisma migrations against the dev database |
| `npm run db:seed` | Run the Prisma seed script (added in Phase 1) |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, and build on every push/PR.
