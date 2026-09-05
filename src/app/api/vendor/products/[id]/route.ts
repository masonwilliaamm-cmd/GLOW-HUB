import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOwnVendorProfile } from "@/lib/vendor";
import { updateProductSchema } from "@/lib/schemas/product";
import { firstIssueMessage } from "@/lib/schemas/shared";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/vendor/products/[id]">,
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (session.role !== "VENDOR") {
    return NextResponse.json({ error: "Vendors only." }, { status: 403 });
  }

  const vendorProfile = await getOwnVendorProfile(session.userId);
  if (!vendorProfile) {
    return NextResponse.json(
      { error: "Complete vendor onboarding first." },
      { status: 409 },
    );
  }

  const { id } = await ctx.params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.vendorId !== vendorProfile.id) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 },
    );
  }

  await db.product.update({ where: { id }, data: parsed.data });

  return NextResponse.json({ ok: true }, { status: 200 });
}
