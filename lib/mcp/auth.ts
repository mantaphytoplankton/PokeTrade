import "server-only";
import { timingSafeEqual } from "node:crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";

// Deliberately not the SDK's OAuth `requireBearerAuth` — there is no token
// issuer here. See specs/mcp/mcp-design.md §4: this data is public and
// read-only, so a manually-verified shared secret (optional, unset by
// default) is the right amount of gate, not a full resource-server flow.
export async function checkOptionalBearerAuth(request: Request): Promise<AuthInfo | Response | undefined> {
  const expectedKey = process.env.MCP_API_KEY;
  if (!expectedKey) return undefined; // open access is the MVP default

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/.exec(header);
  const provided = match?.[1];

  if (!provided || !timingSafeEqualStrings(provided, expectedKey)) {
    return new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: { "content-type": "application/json", "WWW-Authenticate": "Bearer" },
    });
  }

  return { token: provided, clientId: "mcp-api-key", scopes: ["mcp"] };
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
