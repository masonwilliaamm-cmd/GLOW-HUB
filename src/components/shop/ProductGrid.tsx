import type { Prisma } from "@/generated/prisma/client";
import { ProductCard } from "./ProductCard";

type ProductWithVendor = Prisma.ProductGetPayload<{
  include: { vendor: true };
}>;

export function ProductGrid({ products }: { products: ProductWithVendor[] }) {
  if (products.length === 0) {
    return <p>No products match those filters yet.</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))",
        gap: "1rem",
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
