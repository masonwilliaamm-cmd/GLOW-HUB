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

Preview deployments use one shared dev database — Neon (Postgres) + Upstash
(Redis), see `docs/decisions.md` — not isolated per PR, but simplest to set
up and good enough for visual/functional review.

**One-time setup (do this in the Vercel dashboard — needs your Vercel account):**

1. [vercel.com/new](https://vercel.com/new) → Import the `masonwilliaamm-cmd/GLOW-HUB` GitHub repo. Vercel auto-detects Next.js; no build command changes needed.
2. Before or after connecting: run the migration and seed against the real database from a machine with normal internet access (this couldn't be done from within the Claude Code sandbox that built this repo — its network policy blocks outbound connections to arbitrary hosts like Neon/Upstash):
   ```bash
   npm install
   cp .env.example .env.local   # then set DATABASE_URL to the Neon connection string
   npx prisma migrate deploy    # applies the existing migrations (not `migrate dev`)
   npm run db:seed              # optional — same fake data this repo uses locally
   ```
   If either command errors while connected through Neon's pooled endpoint (hostname contains `-pooler`), swap `DATABASE_URL` to the unpooled connection string just for that command (same Neon dashboard), then switch back — Prisma Migrate's advisory locks commonly don't work through a transaction pooler.
3. In the Vercel project's **Settings → Environment Variables**, add these scoped to **Preview**: `DATABASE_URL` (Neon's pooled connection string — that one's fine for the running app), `REDIS_URL` (Upstash — see below), `AUTH_SECRET`.
   - **Redis note:** use a `rediss://default:<token>@<host>:6379` connection string, not Upstash's `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` pair — this app's Redis client (`ioredis`) speaks the standard Redis protocol over TCP, not Upstash's HTTPS REST API. Both forms authenticate against the same database; grab the `rediss://` one from Upstash's console (Redis protocol / "Connect" tab, not the REST API tab).
4. Deploy. Every PR against this repo now gets its own preview deployment automatically, and Vercel posts the URL as a check/comment on the PR — no extra config needed per PR.

Keep **Production** environment variables unset (or pointed at a separate
production DB) until you're actually ready to go live — don't reuse the
shared dev database for Production.
