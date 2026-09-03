# Decisions Log

Tracks the founder decisions flagged as open in `docs/build-plan.md`, so later phases don't re-ask.

| Decision | Status | Choice | Notes |
|---|---|---|---|
| Payment provider | **Confirmed** | Paystack | Wired for real in Phase 5 (pay-in + Transfers API for payouts). |
| Auth method | **Confirmed** | Email + password | Not phone-based OTP. Implemented in Phase 2. |
| Hosting provider (app + managed Postgres) | Open | — | Needed before Phase 5 (real payment integration + production deploy). |
| Cart model (single vs multi-vendor) | Open | — | Build plan recommends one order per vendor at checkout; confirm before Phase 4. |
| Escrow release percentage on dispatch | Open | — | Build plan suggests 80–90%; confirm before Phase 5. |
| Delivery confirmation timeout window | Open | — | Build plan suggests 5–7 days; confirm before Phase 5. |
