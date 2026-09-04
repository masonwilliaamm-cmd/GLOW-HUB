# Decisions Log

Tracks the founder decisions flagged as open in `docs/build-plan.md`, so later phases don't re-ask.

| Decision | Status | Choice | Notes |
|---|---|---|---|
| Payment provider | **Confirmed** | Paystack | Wired for real in Phase 5 (pay-in + Transfers API for payouts). |
| Auth method | **Confirmed** | Email + password | Not phone-based OTP. Implemented in Phase 2. |
| App hosting | **Confirmed** | Vercel | GitHub integration gives automatic preview deployments per PR. |
| Preview database strategy | **Confirmed** | One shared dev Postgres + Redis, used by every preview deployment | Simple to set up, good enough for visual/functional review. Not isolated per PR — a schema change or seed reset on one PR's preview affects all open previews. Revisit if that becomes a problem, or before using a real payment provider in Phase 5 (production should not share the preview database). |
| Preview database connection timing | **Deferred** | Skip wiring `DATABASE_URL`/`REDIS_URL` into Vercel Preview for now | Founder's call: get the preview URL working for static pages first, connect a real database once there's more UI to review. Note for whoever picks this up: as of this decision, Phases 0–3 are already built (auth, roles, vendor onboarding, storefront, product catalog), so "once there's more UI" may already be true — worth a quick check before assuming this is still blocked on UI work. Providers are already chosen (below) and real connection strings for both were shared in chat during this session — ask the founder to resend if they're not still at hand, rather than re-litigating provider choice. |
| Managed Postgres / Redis provider | **Confirmed** | Supabase (Postgres) + Upstash (Redis) | Use Supabase's **Session Pooler** connection string, not the direct one — the direct string resolves IPv6-only, which is unreachable from this sandbox and can be flaky from Vercel's serverless functions too. See README "Deployment" section for setup steps once ready to connect. |
| Cart model (single vs multi-vendor) | Open | — | Build plan recommends one order per vendor at checkout; confirm before Phase 4. |
| Escrow release percentage on dispatch | Open | — | Build plan suggests 80–90%; confirm before Phase 5. |
| Delivery confirmation timeout window | Open | — | Build plan suggests 5–7 days; confirm before Phase 5. |
