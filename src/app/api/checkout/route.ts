import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkoutSchema } from "@/lib/schemas/checkout";
import { firstIssueMessage } from "@/lib/schemas/shared";
import { createOrders, CheckoutError } from "@/lib/orders";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (session.role !== "BUYER") {
    return NextResponse.json({ error: "Buyers only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 },
    );
  }

  const { items, ...shipping } = parsed.data;

  try {
    const orderIds = await createOrders(session.userId, items, shipping);
    return NextResponse.json({ orderIds }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
