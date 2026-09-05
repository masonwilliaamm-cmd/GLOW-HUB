import { findPublicProducts, parseShopFilters } from "@/lib/products";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CartLink } from "@/components/cart/CartLink";

export default async function ShopPage(props: PageProps<"/shop">) {
  const searchParams = await props.searchParams;
  const filters = parseShopFilters(searchParams);
  const products = await findPublicProducts(filters);

  return (
    <main style={{ padding: "2rem", maxWidth: "60rem", margin: "0 auto" }}>
      <h1>Shop</h1>
      <p>
        <CartLink />
      </p>
      <CategoryNav />
      <ProductFilters
        q={filters.query}
        minPrice={filters.minPrice?.toString()}
        maxPrice={filters.maxPrice?.toString()}
        trustTier={filters.trustTier}
      />
      <ProductGrid products={products} />
    </main>
  );
}
