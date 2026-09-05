import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/vendor/ProductForm";

export default async function NewProductPage() {
  const session = await requireRole("VENDOR");

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!vendorProfile) redirect("/vendor/onboarding");

  return (
    <main style={{ padding: "2rem", maxWidth: "32rem", margin: "0 auto" }}>
      <h1>Add product</h1>
      <p>
        <Link href="/vendor/products">← Back to products</Link>
      </p>
      <ProductForm mode="create" />
    </main>
  );
}
