import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { vendorOnboardingSchema, firstIssueMessage } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (session.role !== "VENDOR") {
    return NextResponse.json({ error: "Vendors only." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = vendorOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 },
    );
  }

  const existing = await db.vendorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Business details have already been submitted." },
      { status: 409 },
    );
  }

  await db.vendorProfile.create({
    data: {
      userId: session.userId,
      ...parsed.data,
    },
  });

  return NextResponse.json({ redirectTo: "/vendor/dashboard" }, { status: 201 });
}
