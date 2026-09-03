import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";
import { ToggleActiveButton } from "@/components/vendor/ToggleActiveButton";

export default async function VendorProductsPage() {
  const session = await requireRole("VENDOR");

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!vendorProfile) redirect("/vendor/onboarding");

  const products = await db.product.findMany({
    where: { vendorId: vendorProfile.id },
    orderBy: { title: "asc" },
  });

  return (
    <main style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>My products</h1>
      <p>
        <Link href="/vendor/dashboard">← Back to dashboard</Link>
      </p>
      <p>
        <Link href="/vendor/products/new">+ Add product</Link>
      </p>

      {products.length === 0 && <p>You haven&apos;t added any products yet.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((product) => (
          <li
            key={product.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div>
              <strong>{product.title}</strong>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                {categoryLabel(product.category)} · ₦
                {product.price.toString()} ·{" "}
                {product.stockStatus === "IN_STOCK"
                  ? "In stock"
                  : "Out of stock"}{" "}
                · {product.isActive ? "Active" : "Inactive"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href={`/vendor/products/${product.id}/edit`}>Edit</Link>
              <ToggleActiveButton
                productId={product.id}
                isActive={product.isActive}
              />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
