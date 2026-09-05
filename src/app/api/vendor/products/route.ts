import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getOwnVendorProfile } from "@/lib/vendor";
import { createProductSchema } from "@/lib/schemas/product";
import { firstIssueMessage } from "@/lib/schemas/shared";

export async function POST(request: Request) {
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
      { error: "Complete vendor onboarding before adding products." },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 },
    );
  }

  const product = await db.product.create({
    data: {
      vendorId: vendorProfile.id,
      ...parsed.data,
    },
  });

  return NextResponse.json({ id: product.id }, { status: 201 });
}
