"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

export function CartLink() {
  const { itemCount } = useCart();
  return <Link href="/cart">Cart ({itemCount})</Link>;
}
