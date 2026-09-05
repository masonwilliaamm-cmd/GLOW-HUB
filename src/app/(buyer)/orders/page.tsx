import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAID_ESCROW: "Paid — in escrow",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  DISPUTED: "Disputed",
  RELEASED: "Released",
  REFUNDED: "Refunded",
};

export default async function OrdersPage() {
  const session = await requireRole("BUYER");

  const orders = await db.order.findMany({
    where: { buyerId: session.userId },
    include: { product: true, vendor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>My orders</h1>
      <p>
        <Link href="/account">← Back to account</Link>
      </p>

      {orders.length === 0 && (
        <p>
          No orders yet. <Link href="/shop">Browse the shop</Link>.
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {orders.map((order) => (
          <li
            key={order.id}
            style={{ padding: "0.75rem 0", borderBottom: "1px solid #eee" }}
          >
            <strong>{order.product.title}</strong> × {order.quantity} —{" "}
            {order.vendor.businessName}
            <div style={{ fontSize: "0.85rem", color: "#666" }}>
              ₦{order.totalAmount.toString()} · {STATUS_LABEL[order.status]} ·{" "}
              {order.createdAt.toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
