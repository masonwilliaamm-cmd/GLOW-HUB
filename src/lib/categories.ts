import type { ProductCategory } from "@/generated/prisma/enums";

export const CATEGORIES: { value: ProductCategory; slug: string; label: string }[] = [
  { value: "SKINCARE", slug: "skincare", label: "Skincare" },
  { value: "MAKEUP", slug: "makeup", label: "Makeup" },
  { value: "HAIR", slug: "hair", label: "Hair" },
  { value: "FASHION", slug: "fashion", label: "Fashion" },
  { value: "SHOES", slug: "shoes", label: "Shoes" },
  { value: "ACCESSORIES", slug: "accessories", label: "Accessories" },
  { value: "FRAGRANCE", slug: "fragrance", label: "Fragrance" },
];

export function categoryFromSlug(slug: string): ProductCategory | null {
  return CATEGORIES.find((c) => c.slug === slug)?.value ?? null;
}

export function categoryLabel(value: ProductCategory): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
