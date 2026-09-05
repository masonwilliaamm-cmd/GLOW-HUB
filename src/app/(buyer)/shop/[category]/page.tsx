import { notFound } from "next/navigation";
import { categoryFromSlug, categoryLabel } from "@/lib/categories";
import { findPublicProducts, parseShopFilters } from "@/lib/products";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";

export default async function ShopCategoryPage(
  props: PageProps<"/shop/[category]">,
) {
  const { category: slug } = await props.params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const searchParams = await props.searchParams;
  const filters = parseShopFilters(searchParams, category);
  const products = await findPublicProducts(filters);

  return (
    <main style={{ padding: "2rem", maxWidth: "60rem", margin: "0 auto" }}>
      <h1>{categoryLabel(category)}</h1>
      <CategoryNav currentSlug={slug} />
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
