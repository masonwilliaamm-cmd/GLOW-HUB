import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { VendorOnboardingForm } from "@/components/auth/VendorOnboardingForm";

export default async function VendorOnboardingPage() {
  const session = await requireRole("VENDOR");

  const existing = await db.vendorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (existing) redirect("/vendor/dashboard");

  return (
    <main style={{ padding: "2rem", maxWidth: "28rem", margin: "0 auto" }}>
      <h1>Tell us about your business</h1>
      <p>
        This goes to an admin for review — your storefront stays hidden
        until it&apos;s approved.
      </p>
      <VendorOnboardingForm />
    </main>
  );
}
