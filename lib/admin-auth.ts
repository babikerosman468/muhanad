import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "muhanad_admin";

export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: ADMIN_SESSION_SECONDS,
};

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 bytes");
  }

  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function createAdminSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS,
      nonce: randomBytes(16).toString("hex"),
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined
): boolean {
  if (!token) return false;

  try {
    const parts = token.split(".");

    if (parts.length !== 2) return false;

    const [payload, signature] = parts;

    const expected = Buffer.from(sign(payload));
    const received = Buffer.from(signature);

    if (expected.length !== received.length) return false;

    if (!timingSafeEqual(expected, received)) return false;

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return Number.isSafeInteger(data.exp) &&
      data.exp > Math.floor(Date.now() / 1000);

  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();

  return verifyAdminSessionToken(
    store.get(ADMIN_COOKIE_NAME)?.value
  );
}

export function verifyAdminPassword(candidate: unknown): boolean {
  const configured = process.env.ADMIN_PASSWORD;

  if (typeof candidate !== "string" || !configured) {
    return false;
  }

  const a = Buffer.from(candidate);
  const b = Buffer.from(configured);

  return a.length === b.length && timingSafeEqual(a, b);
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
