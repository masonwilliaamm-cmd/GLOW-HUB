import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import { loginSchema, firstIssueMessage } from "@/lib/schemas/auth";
import { roleHome } from "@/lib/auth";

const INVALID_CREDENTIALS = "Invalid email or password.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    include: { vendorProfile: true },
  });

  // Same error for "no such user" and "wrong password" — don't leak which
  // emails are registered.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  await createSession({ userId: user.id, role: user.role });

  const redirectTo =
    user.role === "VENDOR" && !user.vendorProfile
      ? "/vendor/onboarding"
      : roleHome(user.role);

  return NextResponse.json({ redirectTo }, { status: 200 });
}
