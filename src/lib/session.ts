import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { redis } from "./redis";
import type { UserRole } from "@/generated/prisma/enums";

const SESSION_COOKIE = "glow_hub_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionData = {
  userId: string;
  role: UserRole;
};

// Session data lives in Redis, keyed by an opaque token; the cookie only
// ever holds that token. This lets us revoke a session server-side (e.g.
// on logout, or later a "log out all devices" action) without needing a
// self-contained/signed token scheme.
export async function createSession(data: SessionData): Promise<void> {
  const token = randomBytes(32).toString("hex");
  await redis.set(
    `session:${token}`,
    JSON.stringify(data),
    "EX",
    SESSION_TTL_SECONDS,
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function readSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const raw = await redis.get(`session:${token}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await redis.del(`session:${token}`);
  }
  cookieStore.delete(SESSION_COOKIE);
}
