"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import {
  resolveCartItems,
  type ResolvedCartProduct,
} from "@/lib/cart/resolveCartItems";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<ResolvedCartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    resolveCartItems(items.map((i) => i.productId)).then((resolved) => {
      if (!cancelled) {
        setProducts(resolved);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the set of ids changes, not on every render
  }, [items.map((i) => i.productId).join(",")]);

  if (loading) {
    return <main style={{ padding: "2rem" }}>Loading…</main>;
  }

  const lineItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((x): x is { productId: string; quantity: number; product: ResolvedCartProduct } => x !== null);

  const unavailableCount = items.length - lineItems.length;
  const total = lineItems.reduce(
    (sum, { product, quantity }) => sum + Number(product.price) * quantity,
    0,
  );

  return (
    <main style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>Your cart</h1>

      {lineItems.length === 0 && (
        <p>
          Your cart is empty. <Link href="/shop">Browse the shop</Link>.
        </p>
      )}

      {unavailableCount > 0 && (
        <p style={{ color: "#b3261e" }}>
          {unavailableCount} item{unavailableCount === 1 ? "" : "s"} in your
          cart {unavailableCount === 1 ? "is" : "are"} no longer available and
          {unavailableCount === 1 ? " was" : " were"} left out.
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {lineItems.map(({ product, quantity }) => (
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
                {product.vendorName}
              </div>
              {product.stockStatus === "OUT_OF_STOCK" && (
                <div style={{ color: "#b3261e", fontSize: "0.8rem" }}>
                  Out of stock — remove before checkout
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  updateQuantity(product.id, Number(e.target.value))
                }
                style={{ width: "3.5rem" }}
                aria-label={`Quantity for ${product.title}`}
              />
              <span>
                ₦{(Number(product.price) * quantity).toLocaleString()}
              </span>
              <button onClick={() => removeItem(product.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>

      {lineItems.length > 0 && (
        <>
          <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            Total: ₦{total.toLocaleString()}
          </p>
          <Link href="/checkout">
            <button>Proceed to checkout</button>
          </Link>
        </>
      )}
    </main>
  );
}
