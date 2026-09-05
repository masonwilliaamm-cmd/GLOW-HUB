import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  productIds: z.array(z.string()).max(100),
});

// Public, no-auth endpoint: resolves current price/title/vendor/stock for a
// list of cart product IDs, enforcing the same public visibility rule as
// the storefront (active product, approved vendor). Anything that doesn't
// come back just means "no longer available" to the caller.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (parsed.data.productIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await db.product.findMany({
    where: {
      id: { in: parsed.data.productIds },
      isActive: true,
      vendor: { verificationStatus: "APPROVED" },
    },
    include: { vendor: true },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price.toString(),
      image: p.images[0] ?? null,
      vendorId: p.vendorId,
      vendorName: p.vendor.businessName,
      stockStatus: p.stockStatus,
    })),
  });
}
