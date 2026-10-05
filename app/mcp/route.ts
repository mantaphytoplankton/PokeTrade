import "server-only";
import {
  createMcpHandler,
  McpServer,
  hostHeaderValidationResponse,
  originValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
} from "@modelcontextprotocol/server";
import { registerCatalogTools } from "@/lib/mcp/tools";
import { checkOptionalBearerAuth } from "@/lib/mcp/auth";

// poke-catalog-mcp — see specs/mcp/mcp-design.md. Thin adapter: the factory
// just wires tools to lib/catalog, nothing else lives here.
const handler = createMcpHandler(() => {
  const server = new McpServer({ name: "poke-catalog-mcp", version: "0.1.0" });
  registerCatalogTools(server);
  return server;
});

function allowedHosts(): string[] {
  const configured = (process.env.MCP_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : localhostAllowedHostnames();
}

function allowedOrigins(): string[] {
  const configured = (process.env.MCP_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : localhostAllowedOrigins();
}

async function guarded(request: Request): Promise<Response> {
  const rejected =
    hostHeaderValidationResponse(request, allowedHosts()) ??
    originValidationResponse(request, allowedOrigins());
  if (rejected) return rejected;

  const authResult = await checkOptionalBearerAuth(request);
  if (authResult instanceof Response) return authResult;

  return handler.fetch(request, { authInfo: authResult });
}

export { guarded as GET, guarded as POST };
