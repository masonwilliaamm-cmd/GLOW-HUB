import { requireRole } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function AdminPage() {
  await requireRole("ADMIN");

  return (
    <main style={{ padding: "2rem", maxWidth: "28rem", margin: "0 auto" }}>
      <h1>Admin</h1>
      <p>
        You&apos;re signed in as an admin. The vendor verification queue and
        escrow ledger land in Phase 7 — for now this route just proves
        admin-only access is enforced server-side.
      </p>
      <LogoutButton />
    </main>
  );
}
