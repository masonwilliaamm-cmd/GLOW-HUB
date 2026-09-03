# Glow Hub — Web App Development Plan

A step-by-step build spec for Claude Code. September 2026.

## How to Use This Document

This is a build spec for **Glow Hub**, a Nigeria-based multi-vendor marketplace for beauty, fashion, and accessories, built around an **escrow-on-dispatch** payment model. It is written to be handed directly to Claude Code as a working brief.

Recommended way to work through this with Claude Code:

1. Start a new project, connect the GitHub repo, and paste this document in as context (or upload it as a file in the repo, e.g. `/docs/build-plan.md`).
2. Ask Claude Code to execute one phase at a time, in order. Do not let it jump ahead to Phase 5 before Phase 1–4 are working and tested.
3. After each phase, ask for a short summary of what changed, then test it manually before moving on.
4. Commit to git at the end of every phase, not just at the end of the project. Each phase below is sized to be a reasonable commit.
5. Treat Phase 0–3 as non-negotiable foundation. Escrow logic (Phase 5) is the highest-risk part of the app — do not rush it, and do not let Claude Code "simplify" it by skipping the hold/release state machine.

## 1. Tech Stack (Locked Decisions)

| Layer | Choice |
|---|---|
| Frontend | React + Next.js, mobile-first |
| Backend | Node.js (within Next.js API routes, or a separate Express/Nest service if it outgrows API routes) |
| Database | PostgreSQL |
| Cache/session | Redis |
| Payments | Paystack or Flutterwave (pick one for MVP — Paystack recommended for simpler escrow-style split payouts via their Transfers API) |
| File/image storage | Cloud object storage (e.g. Cloudinary or S3-compatible bucket) |
| SMS | Termii or Africa's Talking |
| Email | Any transactional email provider (e.g. Resend, Postmark) |
| Hosting | Vercel (frontend/API) + managed Postgres (e.g. Supabase, Railway, or Neon) |

Claude Code should ask the user to confirm the payment provider and hosting provider before Phase 5 if not already decided, rather than assuming.

## 2. Core Data Entities (Reference Schema)

These are the entities the whole app is built around. Claude Code should treat this as the source of truth when generating the database schema in Phase 1, adjusting field names/types as needed but preserving the relationships.

- **User** — id, name, email, phone, password_hash, role (buyer/vendor/admin), created_at
- **VendorProfile** — id, user_id (FK), business_name, verification_status, trust_tier (ready_stock / made_to_order), payout_account_details, created_at
- **Product** — id, vendor_id (FK), title, category, description, price, images[], stock_status, is_active
- **Order** — id, buyer_id (FK), vendor_id (FK), product_id (FK), quantity, total_amount, status (pending_payment / paid_escrow / dispatched / delivered / disputed / released / refunded), created_at
- **EscrowTransaction** — id, order_id (FK), amount_held, amount_released_to_vendor, release_percentage_on_dispatch, status (held / partially_released / fully_released / refunded), created_at, updated_at
- **DispatchProof** — id, order_id (FK), courier_name, waybill_number, proof_image_url, submitted_by (vendor_id), submitted_at
- **Dispute** — id, order_id (FK), raised_by (buyer_id), reason, status (open / under_review / resolved_buyer / resolved_vendor), admin_notes, created_at, resolved_at
- **Payout** — id, vendor_id (FK), order_id (FK), amount, status (pending / processing / completed / failed), payment_reference, created_at
- **Subscription** *(future, Phase 3 monetization — schema only, not built in MVP)* — id, vendor_id (FK), plan, status, renews_at

## 3. Development Phases

### Phase 0 — Project Setup & Environment

**Goal:** A running skeleton app with no business logic yet, deployable end to end.

1. Initialize a Next.js (TypeScript) project.
2. Set up PostgreSQL locally and on a managed host; connect via an ORM (Prisma recommended — it will make Phase 1's schema work much faster and safer).
3. Set up Redis for session/cache.
4. Set up environment variable structure (`.env.local`, `.env.example`) for: database URL, Redis URL, payment provider keys, SMS/email provider keys, JWT/auth secret, object storage keys.
5. Set up a basic CI step (lint + type-check) so future phases don't silently break the build.
6. Deploy the empty skeleton to Vercel (or chosen host) so the deployment pipeline is proven working before real features are added.
7. Set up error logging (e.g. Sentry) early — escrow bugs need to be visible immediately, not discovered later.

**Done when:** empty app builds, deploys, and connects to a live database and Redis instance in production.

### Phase 1 — Database Schema

**Goal:** All entities from Section 2 exist as real tables/migrations.

1. Write the Prisma schema (or equivalent) for every entity in Section 2, with proper foreign keys and enums for status fields.
2. Add indexes on frequently-queried fields: `Order.status`, `Order.vendor_id`, `Order.buyer_id`, `EscrowTransaction.order_id`.
3. Run the first migration against the dev database.
4. Seed the database with a small set of fake users, vendors, and products for local testing throughout later phases.

**Done when:** migrations run cleanly, and the seed script produces browsable dummy data.

### Phase 2 — Auth & Roles

**Goal:** Buyers, vendors, and admins can sign up, log in, and are routed to role-appropriate views.

1. Implement email/password auth (or phone-based OTP auth, common for the Nigerian market — confirm which with the user before building) with hashed passwords and JWT or session cookies.
2. Implement role-based access control: buyer, vendor, admin. Vendor and admin routes must be server-side protected, not just hidden in the UI.
3. Build vendor onboarding flow: signup → business details form → "pending verification" state until an admin approves.
4. Build simple account/profile pages for buyers and vendors.

**Done when:** a user can register as a buyer or vendor, log in, and is blocked from routes outside their role.

### Phase 3 — Vendor Storefronts & Product Catalog

**Goal:** Verified vendors can list products; buyers can browse them.

1. Vendor dashboard: add/edit/deactivate products, upload product images to object storage, set trust tier (ready_stock vs made_to_order).
2. Public buyer-facing storefront: category browse (skincare, makeup, hair, fashion, shoes, accessories, fragrance), individual vendor pages, individual product pages.
3. Search and filter by category, price range, and trust tier.
4. Only show products from vendors with `verification_status = approved`.

**Done when:** a buyer can browse real vendor-submitted products across categories with working search/filter, using only verified vendors' listings.

### Phase 4 — Buyer Checkout Flow (Pre-Payment)

**Goal:** Cart and checkout UI exist and produce a valid Order record in `pending_payment` status — before wiring real money movement.

1. Cart functionality (single or multi-vendor cart — decide with the user; multi-vendor carts add complexity, so MVP should probably split into one order per vendor at checkout).
2. Checkout form: shipping address, contact details, order summary.
3. On submit, create an Order row with status `pending_payment` and an associated EscrowTransaction row with status `held` (amount not yet actually captured).
4. Redirect to payment step (built in Phase 5).

**Done when:** placing an order creates correct Order and EscrowTransaction records, without any real payment yet.

### Phase 5 — Escrow Payment Integration (Highest Risk Phase)

**Goal:** Real money moves correctly and safely through the escrow state machine.

1. Integrate the chosen payment provider's pay-in flow: buyer is charged at checkout, funds land in the platform's account, not the vendor's.
2. On successful payment webhook, update `Order.status` → `paid_escrow` and `EscrowTransaction.status` → `held`. **Do this update from the payment provider's webhook, never from the client-side redirect alone** — client-side confirmation can be spoofed or dropped.
3. Build the vendor "confirm dispatch" action: vendor submits DispatchProof (courier name + waybill number, optionally a photo).
4. On dispatch confirmation, trigger the release logic:
   - Release the configured percentage (e.g. 80–90%) of `amount_held` to the vendor via the payment provider's Transfers/payout API.
   - Update `EscrowTransaction.status` → `partially_released`, `Order.status` → `dispatched`.
   - Log a Payout record for the released amount.
5. Build the delivery confirmation step for buyers: buyer confirms delivery, or a fixed time window elapses with no dispute raised (e.g. 5–7 days — confirm exact window with the user).
6. On confirmed delivery (explicit or by timeout), release the remaining balance to the vendor, update `EscrowTransaction.status` → `fully_released`, `Order.status` → `delivered`, and log the final Payout.
7. Build the dispute path: if a buyer disputes before delivery confirmation, block the automatic timeout-release, set `Order.status` → `disputed`, create a Dispute record, and route it to the admin dispute console (Phase 7).
8. Write automated tests for the state machine specifically: paid → dispatched → delivered (happy path), paid → dispatched → disputed → resolved_buyer (refund path), paid → dispatched → disputed → resolved_vendor (release path). These are the transactions that must never be wrong.

**Done when:** a full test order can move real (or sandbox-mode) funds through pay-in → partial release on dispatch → full release on delivery, and the dispute path correctly blocks premature release.

### Phase 6 — Notifications

**Goal:** Buyers and vendors are kept informed at every state change without needing to check the app manually.

1. Wire SMS and/or email notifications for: order placed, payment confirmed, dispatch confirmed, delivery window reminder, dispute opened, dispute resolved, payout completed.
2. Add in-app notification indicators for the same events.

**Done when:** every status change in the Order state machine fires at least one notification to the relevant party.

### Phase 7 — Admin Dashboard

**Goal:** The internal control room that makes the "your payment is protected" promise operationally real.

1. Vendor verification queue: approve/reject pending vendor applications, view submitted business details.
2. Live order & escrow ledger: table of all orders with current status, amount held, amount released — this is the source of truth for "where is every buyer's money right now."
3. Dispute resolution console: view a disputed order's full history (order, dispatch proof, buyer's dispute reason), and let an admin resolve in favor of buyer (trigger refund) or vendor (trigger release), with a mandatory admin note logged against the Dispute record.
4. Basic platform metrics: number of active vendors, orders this week, total value currently held in escrow, disputes open.

**Done when:** an admin can fully verify a vendor, monitor live escrow balances, and resolve a disputed order end-to-end from the dashboard, with money actually moving as a result of their decision.

### Phase 8 — Sandbox Testing & Hardening

**Goal:** Confidence that the escrow flow is safe before real vendors and real money are involved.

1. Run the full order lifecycle in the payment provider's sandbox/test mode multiple times, covering happy path, dispute-resolved-to-buyer, dispute-resolved-to-vendor, and timeout-based auto-release.
2. Test webhook failure handling: what happens if the payment provider's webhook is delayed, duplicated, or fails to arrive — the system should not double-release funds or lose track of an order's true status.
3. Test edge cases: vendor never confirms dispatch, buyer never confirms delivery and the window lapses, dispute raised after auto-release already happened.
4. Basic security pass: confirm role-protected routes actually reject unauthorized access server-side, confirm payment webhook endpoints verify the provider's signature, confirm no secret keys are exposed client-side.

**Done when:** the team is comfortable the escrow logic won't lose or misroute buyer money under normal failure conditions.

### Phase 9 — Closed Pilot Launch

**Goal:** Real vendors, real (small-scale) transactions, before public launch.

1. Manually onboard and verify 5–10 real vendors.
2. Soft-launch to a small buyer audience (e.g. existing WhatsApp/Instagram followers of pilot vendors).
3. Monitor the admin ledger daily during the pilot; be ready to manually intervene on any transaction that looks stuck.
4. Collect feedback from both vendors and buyers specifically on trust/payment clarity, since that's the core value proposition — not just general UX feedback.
5. Fix issues found, then move to public launch and Phase 3 monetization features (commission billing, subscriptions) as separate future work.

**Done when:** the pilot vendors complete real orders through the full escrow cycle with no manual money-recovery incidents.

## 4. Suggested Repo Structure

```
glow-hub/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── (buyer)/          # storefront, cart, checkout
│   │   ├── (vendor)/         # vendor dashboard
│   │   ├── (admin)/          # admin dashboard
│   │   └── api/
│   │       ├── auth/
│   │       ├── orders/
│   │       ├── escrow/
│   │       ├── webhooks/     # payment provider webhooks
│   │       └── notifications/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   ├── payments/         # provider-specific pay-in/payout logic
│   │   └── escrow/           # the state machine logic, isolated and testable
│   └── components/
├── tests/
│   └── escrow-state-machine.test.ts
├── .env.example
└── docs/
    └── build-plan.md         # this document
```

Keeping the escrow state machine logic in its own isolated module (`src/lib/escrow/`) rather than scattered across API routes will make it far easier to test and to reason about — Claude Code should be instructed to build it this way from Phase 5 onward.

## 5. Notes for Claude Code

- Work phase by phase. Do not skip ahead to payments/escrow (Phase 5) before auth, roles, and the order-creation flow (Phases 2–4) are solid.
- Flag any assumption you make (payment provider choice, OTP vs password auth, single vs multi-vendor cart, exact escrow release percentages and timeout windows) instead of silently picking one, since these are real business decisions the founder should confirm.
- Prioritize correctness over speed in Phase 5 specifically — an escrow bug is a money-losing bug, not a cosmetic one.
- Never log or expose payment provider secret keys client-side.
- After each phase, provide a short plain-English summary of what was built and what to manually test before moving on.
