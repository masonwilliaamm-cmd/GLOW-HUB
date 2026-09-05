export type ResolvedCartProduct = {
  id: string;
  title: string;
  price: string;
  image: string | null;
  vendorId: string;
  vendorName: string;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK";
};

export async function resolveCartItems(
  productIds: string[],
): Promise<ResolvedCartProduct[]> {
  if (productIds.length === 0) return [];

  const response = await fetch("/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds }),
  });
  if (!response.ok) return [];

  const data = await response.json().catch(() => ({ products: [] }));
  return (data.products ?? []) as ResolvedCartProduct[];
}
