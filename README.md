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

Preview deployments use one shared dev database (see `docs/decisions.md`) —
not isolated per PR, but simplest to set up and good enough for visual/functional
review.

**One-time setup (do this in the Vercel dashboard — needs your Vercel account):**

1. [vercel.com/new](https://vercel.com/new) → Import the `masonwilliaamm-cmd/GLOW-HUB` GitHub repo. Vercel auto-detects Next.js; no build command changes needed.
2. Provision one dev-tier Postgres (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and one dev-tier Redis (e.g. [Upstash](https://upstash.com) — its standard Redis endpoint works fine with the `ioredis` client already in use here, no code changes needed).
3. Run `npm run db:migrate` once (locally, with `.env.local` pointed at that new `DATABASE_URL`) to create the schema, then `npm run db:seed` if you want the same fake data this repo uses locally.
4. In the Vercel project's **Settings → Environment Variables**, add the vars from `.env.example`, scoped to **Preview**: at minimum `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`. Add the Paystack/Termii/Resend/Cloudinary/Sentry keys as those integrations go live in later phases.
5. Deploy. From then on, every PR against this repo gets its own preview deployment, and Vercel posts the preview URL as a check/comment on the PR automatically — no extra config needed per PR.

Keep **Production** environment variables unset (or pointed at a separate
production DB) until you're actually ready to go live — don't reuse this
shared dev database for Production.
