import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/auth/LogoutButton";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending verification",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default async function VendorDashboardPage() {
  const session = await requireRole("VENDOR");

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!vendorProfile) redirect("/vendor/onboarding");

  return (
    <main style={{ padding: "2rem", maxWidth: "28rem", margin: "0 auto" }}>
      <h1>{vendorProfile.businessName}</h1>
      <p>
        Status: <strong>{STATUS_LABEL[vendorProfile.verificationStatus]}</strong>
      </p>
      {vendorProfile.verificationStatus === "PENDING" && (
        <p>
          An admin needs to approve your account before your storefront and
          products go live. We&apos;ll notify you once that happens.
        </p>
      )}
      <dl>
        <dt>Stock model</dt>
        <dd>
          {vendorProfile.trustTier === "READY_STOCK"
            ? "Ready stock"
            : "Made to order"}
        </dd>
      </dl>
      <p>
        <Link href="/vendor/products">Manage products</Link>
      </p>
      <LogoutButton />
    </main>
  );
}
