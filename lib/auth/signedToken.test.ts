import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSignedToken, verifySignedToken } from "./signedToken";

describe("signed tokens", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "test-secret-not-for-prod";
  });

  it("round-trips valid claims", () => {
    const token = createSignedToken("session", { userId: "u1" });
    const result = verifySignedToken<{ userId: string }>(token, "session", 1000 * 60);
    expect(result?.userId).toBe("u1");
  });

  it("rejects a token of the wrong kind", () => {
    const token = createSignedToken("reset", { userId: "u1" });
    expect(verifySignedToken(token, "session", 1000 * 60)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const token = createSignedToken("session", { userId: "u1" });
    const [payloadB64, signature] = token.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({ kind: "session", issuedAt: Date.now(), userId: "attacker" })).toString("base64url");
    const tampered = `${tamperedPayload}.${signature}`;
    expect(verifySignedToken(tampered, "session", 1000 * 60)).toBeNull();
    expect(payloadB64).toBeTruthy();
  });

  it("rejects an expired token", () => {
    const token = createSignedToken("session", { userId: "u1" });
    expect(verifySignedToken(token, "session", -1)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifySignedToken("not-a-real-token", "session", 1000 * 60)).toBeNull();
    expect(verifySignedToken(null, "session", 1000 * 60)).toBeNull();
  });

  it("uses a different secret across tests isolation (sanity)", () => {
    const token = createSignedToken("session", { userId: "u1" });
    process.env.SESSION_SECRET = "a-different-secret";
    expect(verifySignedToken(token, "session", 1000 * 60)).toBeNull();
  });

  afterEach(() => {
    delete process.env.SESSION_SECRET;
  });
});
