import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession, type SessionData } from "./session";
import type { UserRole } from "@/generated/prisma/enums";

// Memoized per request: safe to call from a layout and a page (or several
// leaf components) in the same render without hitting Redis more than once.
export const getSession = cache(readSession);

export function roleHome(role: UserRole): string {
  switch (role) {
    case "BUYER":
      return "/account";
    case "VENDOR":
      return "/vendor/dashboard";
    case "ADMIN":
      return "/admin";
  }
}

// For Server Components (pages, layouts): redirects rather than returning
// null, since a signed-out user has no business rendering a protected page.
export async function verifySession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: UserRole): Promise<SessionData> {
  const session = await verifySession();
  if (session.role !== role) redirect(roleHome(session.role));
  return session;
}
