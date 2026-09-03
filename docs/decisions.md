# Decisions Log

Tracks the founder decisions flagged as open in `docs/build-plan.md`, so later phases don't re-ask.

| Decision | Status | Choice | Notes |
|---|---|---|---|
| Payment provider | **Confirmed** | Paystack | Wired for real in Phase 5 (pay-in + Transfers API for payouts). |
| Auth method | **Confirmed** | Email + password | Not phone-based OTP. Implemented in Phase 2. |
| App hosting | **Confirmed** | Vercel | GitHub integration gives automatic preview deployments per PR. |
| Preview database strategy | **Confirmed** | One shared dev Postgres + Redis, used by every preview deployment | Simple to set up, good enough for visual/functional review. Not isolated per PR — a schema change or seed reset on one PR's preview affects all open previews. Revisit if that becomes a problem, or before using a real payment provider in Phase 5 (production should not share the preview database). |
| Managed Postgres / Redis provider | Open | — | Need an actual provider (e.g. Neon/Supabase for Postgres, Upstash for Redis) — see README "Deployment" section for setup steps. |
| Cart model (single vs multi-vendor) | Open | — | Build plan recommends one order per vendor at checkout; confirm before Phase 4. |
| Escrow release percentage on dispatch | Open | — | Build plan suggests 80–90%; confirm before Phase 5. |
| Delivery confirmation timeout window | Open | — | Build plan suggests 5–7 days; confirm before Phase 5. |
