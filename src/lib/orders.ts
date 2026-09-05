import { db } from "./db";

// Provisional — the build plan suggests releasing 80–90% of the held
// amount to the vendor on dispatch. Still needs founder confirmation
// before Phase 5 wires this up to real payouts (see docs/decisions.md).
export const DEFAULT_ESCROW_RELEASE_PERCENTAGE = 80;

export type CheckoutItem = { productId: string; quantity: number };

export type ShippingDetails = {
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  contactPhone: string;
};

export class CheckoutError extends Error {}

// Creates one Order (+ one held EscrowTransaction) per cart line item,
// atomically. Deliberately re-fetches each product from the database
// rather than trusting anything the client sent about price, vendor, or
// availability — the cart only ever carries {productId, quantity}.
export async function createOrders(
  buyerId: string,
  items: CheckoutItem[],
  shipping: ShippingDetails,
): Promise<string[]> {
  const productIds = items.map((item) => item.productId);
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
      vendor: { verificationStatus: "APPROVED" },
    },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      throw new CheckoutError(
        "One of the items in your cart is no longer available.",
      );
    }
    if (product.stockStatus === "OUT_OF_STOCK") {
      throw new CheckoutError(`"${product.title}" is out of stock.`);
    }
  }

  const created = await db.$transaction(
    items.map((item) => {
      const product = productById.get(item.productId)!;
      const totalAmount = product.price.times(item.quantity);

      return db.order.create({
        data: {
          buyerId,
          vendorId: product.vendorId,
          productId: product.id,
          quantity: item.quantity,
          totalAmount,
          status: "PENDING_PAYMENT",
          ...shipping,
          escrowTransaction: {
            create: {
              amountHeld: totalAmount,
              releasePercentageOnDispatch: DEFAULT_ESCROW_RELEASE_PERCENTAGE,
              status: "HELD",
            },
          },
        },
        select: { id: true },
      });
    }),
  );

  return created.map((order) => order.id);
}
