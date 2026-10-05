import "server-only";
import { createSignedToken, verifySignedToken } from "./signedToken";

export const SESSION_COOKIE_NAME = "poketrade_session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function createSessionToken(userId: string): string {
  return createSignedToken("session", { userId });
}

export function verifySessionToken(token: string | undefined | null): { userId: string } | null {
  const payload = verifySignedToken<{ userId: string }>(token, "session", SESSION_MAX_AGE_MS);
  return payload ? { userId: payload.userId } : null;
}
