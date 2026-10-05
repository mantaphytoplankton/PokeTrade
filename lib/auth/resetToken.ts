import "server-only";
import { createSignedToken, verifySignedToken } from "./signedToken";

const RESET_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour

export function createResetToken(userId: string): string {
  return createSignedToken("reset", { userId });
}

export function verifyResetToken(token: string | undefined | null): { userId: string } | null {
  const payload = verifySignedToken<{ userId: string }>(token, "reset", RESET_MAX_AGE_MS);
  return payload ? { userId: payload.userId } : null;
}
