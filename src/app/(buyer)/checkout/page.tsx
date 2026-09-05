import { requireRole } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage() {
  await requireRole("BUYER");

  return (
    <main style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>Checkout</h1>
      <CheckoutForm />
    </main>
  );
}
