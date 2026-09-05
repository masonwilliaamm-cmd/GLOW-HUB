"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";
import {
  resolveCartItems,
  type ResolvedCartProduct,
} from "@/lib/cart/resolveCartItems";
import { parseJsonResponse } from "@/lib/parseJsonResponse";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [products, setProducts] = useState<ResolvedCartProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    resolveCartItems(items.map((i) => i.productId)).then((resolved) => {
      if (!cancelled) {
        setProducts(resolved);
        setLoadingProducts(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolve once on mount from the cart snapshot; the form doesn't need to react to later cart edits
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      items,
      shippingAddress: formData.get("shippingAddress"),
      shippingCity: formData.get("shippingCity"),
      shippingState: formData.get("shippingState"),
      contactPhone: formData.get("contactPhone"),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        setError((data.error as string) ?? `Something went wrong (${response.status}).`);
        return;
      }

      clear();
      router.push("/orders");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return <p>Your cart is empty.</p>;
  }
  if (loadingProducts) {
    return <p>Loading…</p>;
  }

  const lineItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(
      (x): x is { productId: string; quantity: number; product: ResolvedCartProduct } =>
        x !== null,
    );

  const outOfStockCount = lineItems.filter(
    ({ product }) => product.stockStatus === "OUT_OF_STOCK",
  ).length;

  const total = lineItems.reduce(
    (sum, { product, quantity }) => sum + Number(product.price) * quantity,
    0,
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      <section>
        <h2>Order summary</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {lineItems.map(({ product, quantity }) => (
            <li
              key={product.id}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>
                {product.title} × {quantity} ({product.vendorName})
              </span>
              <span>₦{(Number(product.price) * quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontWeight: 600 }}>Total: ₦{total.toLocaleString()}</p>
        {outOfStockCount > 0 && (
          <p style={{ color: "#b3261e" }}>
            One or more items are out of stock — remove them from your cart
            before placing this order.
          </p>
        )}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <h2>Shipping details</h2>
        <div>
          <label htmlFor="shippingAddress">Address</label>
          <input
            id="shippingAddress"
            name="shippingAddress"
            required
            minLength={5}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label htmlFor="shippingCity">City</label>
          <input
            id="shippingCity"
            name="shippingCity"
            required
            minLength={2}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label htmlFor="shippingState">State</label>
          <input
            id="shippingState"
            name="shippingState"
            required
            minLength={2}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label htmlFor="contactPhone">Contact phone</label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            required
            minLength={7}
            style={{ width: "100%" }}
          />
        </div>
      </section>

      {error && <p style={{ color: "#b3261e" }}>{error}</p>}

      <button type="submit" disabled={pending || outOfStockCount > 0}>
        {pending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
