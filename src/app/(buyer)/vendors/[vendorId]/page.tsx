import { notFound } from "next/navigation";
import { findApprovedVendor, findPublicProducts } from "@/lib/products";
import { ProductGrid } from "@/components/shop/ProductGrid";

export default async function VendorStorefrontPage(
  props: PageProps<"/vendors/[vendorId]">,
) {
  const { vendorId } = await props.params;

  const vendor = await findApprovedVendor(vendorId);
  if (!vendor) notFound();

  const products = await findPublicProducts({ vendorId });

  return (
    <main style={{ padding: "2rem", maxWidth: "60rem", margin: "0 auto" }}>
      <h1>{vendor.businessName}</h1>
      <p style={{ color: "#666" }}>
        {vendor.trustTier === "READY_STOCK" ? "Ready stock" : "Made to order"}
      </p>
      <ProductGrid products={products} />
    </main>
  );
}
