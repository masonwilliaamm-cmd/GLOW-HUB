import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function AccountPage() {
  const session = await requireRole("BUYER");
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { name: true, email: true, phone: true },
  });

  return (
    <main style={{ padding: "2rem", maxWidth: "28rem", margin: "0 auto" }}>
      <h1>My account</h1>
      <dl>
        <dt>Name</dt>
        <dd>{user.name}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Phone</dt>
        <dd>{user.phone ?? "—"}</dd>
      </dl>
      <LogoutButton />
    </main>
  );
}
