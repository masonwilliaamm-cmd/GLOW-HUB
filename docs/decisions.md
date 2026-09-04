# Decisions Log

Tracks the founder decisions flagged as open in `docs/build-plan.md`, so later phases don't re-ask.

| Decision | Status | Choice | Notes |
|---|---|---|---|
| Payment provider | **Confirmed** | Paystack | Wired for real in Phase 5 (pay-in + Transfers API for payouts). |
| Auth method | **Confirmed** | Email + password | Not phone-based OTP. Implemented in Phase 2. |
| App hosting | **Confirmed** | Vercel | GitHub integration gives automatic preview deployments per PR. |
| Preview database strategy | **Confirmed** | One shared dev Postgres + Redis, used by every preview deployment | Simple to set up, good enough for visual/functional review. Not isolated per PR — a schema change or seed reset on one PR's preview affects all open previews. Revisit if that becomes a problem, or before using a real payment provider in Phase 5 (production should not share the preview database). |
| Managed Postgres / Redis provider | **Confirmed** | Neon (Postgres) + Upstash (Redis) | Switched from an earlier Supabase pick — Neon's pooled connection string was provided directly, sidestepping the IPv6 direct-connection issue Supabase had. Real connection strings were shared in chat and are in this Claude Code environment's `.env.local` (gitignored, never committed) — ask the founder to resend if a fresh session needs them and they're not still at hand. |
| Preview database connection timing | **Confirmed** | `DATABASE_URL`/`REDIS_URL`/`AUTH_SECRET` added to Vercel Preview | Migration/seed against the real database could **not** be run from this Claude Code sandbox: its network policy blocks all outbound traffic except a small preapproved allowlist (npm, PyPI, GitHub, etc.), confirmed by testing raw TCP to both Neon (port 5432) and Upstash (port 6379, and even proxied HTTPS to Upstash) — all rejected. The founder ran `prisma migrate deploy` + `db:seed` from their own machine and added the env vars to Vercel directly — this repo has no record of whether either step hit an error; ask the founder if a preview deployment shows a database-shaped failure. |
| Prisma pooled vs. direct connection (Neon) | Note | — | This Prisma version (7.10.0)'s `prisma.config.ts` datasource only supports `url`/`shadowDatabaseUrl` — no `directUrl`, despite some docs describing one. If `prisma migrate`/`db seed` errors through Neon's pooled connection string (PgBouncer transaction poolers commonly break Prisma's migration advisory locks), swap `DATABASE_URL` to the unpooled connection string (same Neon dashboard, no "-pooler" in the hostname) just for that command, then switch back. |
| Cart model (single vs multi-vendor) | Open | — | Build plan recommends one order per vendor at checkout; confirm before Phase 4. |
| Escrow release percentage on dispatch | Open | — | Build plan suggests 80–90%; confirm before Phase 5. |
| Delivery confirmation timeout window | Open | — | Build plan suggests 5–7 days; confirm before Phase 5. |
