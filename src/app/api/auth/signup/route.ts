import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import { signupSchema, firstIssueMessage } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 },
    );
  }

  const { name, email, phone, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      phone: phone ? phone : null,
      passwordHash,
      role,
    },
  });

  await createSession({ userId: user.id, role: user.role });

  const redirectTo = role === "VENDOR" ? "/vendor/onboarding" : "/account";
  return NextResponse.json({ redirectTo }, { status: 201 });
}
