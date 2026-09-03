import { db } from "./db";
import type { ProductCategory, TrustTier, Prisma } from "@/generated/prisma/client";

export type ProductFilters = {
  category?: ProductCategory;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  trustTier?: TrustTier;
  query?: string;
};

// The storefront only ever shows active products from approved vendors —
// centralized here so every public listing (shop, category, vendor page)
// enforces it the same way.
export function findPublicProducts(filters: ProductFilters) {
  const price: Prisma.DecimalFilter<"Product"> = {};
  if (filters.minPrice !== undefined) price.gte = filters.minPrice;
  if (filters.maxPrice !== undefined) price.lte = filters.maxPrice;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    vendor: {
      verificationStatus: "APPROVED",
      ...(filters.trustTier ? { trustTier: filters.trustTier } : {}),
    },
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.vendorId ? { vendorId: filters.vendorId } : {}),
    ...(filters.query
      ? { title: { contains: filters.query, mode: "insensitive" } }
      : {}),
    ...(Object.keys(price).length > 0 ? { price } : {}),
  };

  return db.product.findMany({
    where,
    include: { vendor: true },
    orderBy: { title: "asc" },
  });
}

export function findPublicProduct(id: string) {
  return db.product.findFirst({
    where: { id, isActive: true, vendor: { verificationStatus: "APPROVED" } },
    include: { vendor: true },
  });
}

export function findApprovedVendor(vendorId: string) {
  return db.vendorProfile.findFirst({
    where: { id: vendorId, verificationStatus: "APPROVED" },
  });
}

export type ShopSearchParams = { [key: string]: string | string[] | undefined };

// Shared between /shop and /shop/[category] — the only difference between
// those two pages is whether `category` is pinned by the route segment.
export function parseShopFilters(
  searchParams: ShopSearchParams,
  category?: ProductCategory,
): ProductFilters {
  const get = (key: string): string | undefined => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const minPrice = get("minPrice");
  const maxPrice = get("maxPrice");
  const trustTier = get("trustTier");
  const q = get("q");

  return {
    category,
    query: q ? q : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    trustTier:
      trustTier === "READY_STOCK" || trustTier === "MADE_TO_ORDER"
        ? trustTier
        : undefined,
  };
}
