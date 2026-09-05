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

You'll need a local PostgreSQL instance and Redis instance running (or point `.env.local` at hosted ones, e.g. Railway's public connection strings) for `db:migrate`/`db:seed` and the Redis client to connect.

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

## Deployment (Railway)

The app, Postgres, and Redis are all hosted on Railway (see
`docs/decisions.md` — switched from Vercel/Neon/Upstash). Railway builds this
repo with [Nixpacks](https://nixpacks.com/), which auto-detects the Next.js
project: `npm install` (runs `postinstall` → `prisma generate`), `npm run
build`, then `npm start` (`next start`). No Railway-specific build config is
needed — `next start` already reads the `PORT` env var Railway injects.

**One thing that did need a code change:** `next/image` optimization
requires the `sharp` package at runtime on any self-hosted Node server
(Vercel's own infrastructure handles this instead, so it wasn't needed
there). Already added as a dependency.

**One-time setup (do this in the Railway dashboard — needs your Railway account):**

1. New Project → Deploy from GitHub repo → select `masonwilliaamm-cmd/GLOW-HUB`.
2. Add a **Postgres** and a **Redis** plugin to the same project.
3. On the app service's **Variables** tab, reference the plugins' connection strings rather than copy-pasting them, so they stay in sync if Railway ever rotates credentials: `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`, `REDIS_URL` = `${{Redis.REDIS_URL}}` (exact reference names may differ slightly — Railway autocompletes these). Add `AUTH_SECRET` as a plain value.
4. Run the migration and seed against the real database from a machine with normal internet access (this couldn't be done from within the Claude Code sandbox that built this repo — its network policy blocks outbound connections to arbitrary hosts):
   ```bash
   npm install
   cp .env.example .env.local   # then set DATABASE_URL to Postgres's public connection string
   npx prisma migrate deploy    # applies the existing migrations (not `migrate dev`)
   npm run db:seed              # optional — same fake data this repo uses locally
   ```
   Use the plugin's **public** connection string for this (Postgres/Redis's "Connect" tab → public/TCP proxy host, not the `*.railway.internal` one) — the internal hostname only resolves from inside Railway's own network, not from your machine or this Claude Code sandbox. The running app itself can use either; the internal one is slightly faster/more private if you switch to it later.
5. Deploy.

**On PR preview links specifically** (the original ask that started this
thread): Railway's per-PR preview environments work differently from
Vercel's zero-config default — check Railway's project settings for
"PR Environments" and confirm it's enabled/available on your plan. I haven't
verified this from here since it's a Railway-dashboard setting, not
something in this repo.
