import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless, signed tokens — no session store, no new dependency
// (see specs/app/app-design.md §2). Both session cookies and password-reset
// links are one of these, distinguished by `kind` so a leaked reset token
// can never be replayed as a login session or vice versa.
function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

export function createSignedToken<T extends Record<string, unknown>>(
  kind: string,
  claims: T,
): string {
  const payload = { kind, issuedAt: Date.now(), ...claims };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySignedToken<T>(
  token: string | undefined | null,
  kind: string,
  maxAgeMs: number,
): (T & { issuedAt: number }) | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: { kind: string; issuedAt: number } & Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  } catch {
    return null;
  }

  if (payload.kind !== kind) return null;
  const age = Date.now() - payload.issuedAt;
  if (age < 0 || age > maxAgeMs) return null;

  return payload as T & { issuedAt: number };
}
