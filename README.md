# Glow Hub

Nigeria-based multi-vendor marketplace for beauty, fashion, and accessories, built around an escrow-on-dispatch payment model.

The full build spec is in [`docs/build-plan.md`](./docs/build-plan.md) — this repo is being built phase by phase from that document. **Phases 0–3 are complete** (project setup, database schema, auth & roles, vendor storefronts & product catalog); see the plan for what's next. Founder decisions made along the way are tracked in [`docs/decisions.md`](./docs/decisions.md).

## Tech stack

- **Frontend/backend:** Next.js (App Router, TypeScript), mobile-first
- **Database:** PostgreSQL via Prisma
- **Cache/session:** Redis
- **Error logging:** Sentry
- Payments, SMS, email, and object storage providers are Phase 3–6 decisions — see `docs/build-plan.md` §1.

## Getting started

```bash
npm install                  # also generates the Prisma client (postinstall)
cp .env.example .env.local   # fill in DATABASE_URL, REDIS_URL, etc.
npm run dev
```

You'll need a local PostgreSQL instance and Redis instance running (or point `.env.local` at hosted ones) for `db:migrate`/`db:seed` and the Redis client to connect.

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

## Deployment (Vercel)

The app is hosted on Vercel (see `docs/decisions.md`), which gives every PR a
live preview URL automatically once the repo is connected.

**Current setup: no database in Preview yet.** Only static routes (right now,
just `/`) will render — every dynamic route (auth, `/shop`, vendor pages,
etc.) will 500 in previews until a real `DATABASE_URL`/`REDIS_URL` is added.
That's a deliberate, temporary call — see `docs/decisions.md` — not a bug.

**One-time setup (do this in the Vercel dashboard — needs your Vercel account):**

1. [vercel.com/new](https://vercel.com/new) → Import the `masonwilliaamm-cmd/GLOW-HUB` GitHub repo. Vercel auto-detects Next.js; no build command changes needed.
2. (Optional but harmless) In **Settings → Environment Variables**, add `AUTH_SECRET` scoped to **Preview** — doesn't require a database, and saves a step later.
3. Deploy. Every PR against this repo now gets its own preview deployment automatically, and Vercel posts the URL as a check/comment on the PR — no extra config needed per PR.

**Later, once you're ready to connect a real database** (see
`docs/decisions.md` for the "why now" trigger):

1. Provision one dev-tier Postgres (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and one dev-tier Redis (e.g. [Upstash](https://upstash.com) — its standard Redis endpoint works fine with the `ioredis` client already in use here, no code changes needed).
2. Run `npm run db:migrate` once (locally, with `.env.local` pointed at that new `DATABASE_URL`) to create the schema, then `npm run db:seed` if you want the same fake data this repo uses locally.
3. In the Vercel project's **Settings → Environment Variables**, add `DATABASE_URL` and `REDIS_URL` scoped to **Preview** (plus any of the other `.env.example` vars whose integrations have gone live by then). Every preview deployment shares this one dev database — not isolated per PR, but simplest to set up and good enough for visual/functional review.
4. Redeploy (or just wait for the next PR) — dynamic routes now work in previews too.

Keep **Production** environment variables unset (or pointed at a separate
production DB) until you're actually ready to go live — don't reuse the
shared dev database for Production.
