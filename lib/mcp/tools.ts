import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { CardIdentity, PriceSnapshot, toolResultSchema } from "@/lib/schemas";
import { searchCards } from "@/lib/catalog/search";
import { getCard } from "@/lib/catalog/card";
import { getPriceSnapshot } from "@/lib/catalog/price";

// Thin protocol adapter over lib/catalog — see specs/mcp/mcp-design.md §5/§6.
// No business logic here; every tool just shapes a lib/catalog call as an
// MCP result.
export function registerCatalogTools(server: McpServer): void {
  server.registerTool(
    "search_cards",
    {
      description:
        "Search the Pokémon TCG catalog by card name, set code, or card number. Returns standardized card identities; an empty array if nothing matches.",
      inputSchema: z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).optional(),
      }),
      outputSchema: toolResultSchema(z.array(CardIdentity)),
    },
    async ({ query, limit }) => {
      const result = await searchCards(query, { limit });
      return {
        content: [
          {
            type: "text",
            text: result.ok ? `Found ${result.data.length} card(s).` : `Search failed: ${result.reason}`,
          },
        ],
        structuredContent: result,
        isError: !result.ok,
      };
    },
  );

  server.registerTool(
    "get_card",
    {
      description:
        "Get full catalog details and current price snapshot for one card by its catalog ID (e.g. 'base1-4').",
      inputSchema: z.object({ cardId: z.string().min(1) }),
      outputSchema: toolResultSchema(z.object({ identity: CardIdentity, price: PriceSnapshot })),
    },
    async ({ cardId }) => {
      const result = await getCard(cardId);
      return {
        content: [
          {
            type: "text",
            text: result.ok ? `Found ${result.data.identity.name}.` : `Not found: ${result.reason}`,
          },
        ],
        structuredContent: result,
        isError: !result.ok,
      };
    },
  );

  server.registerTool(
    "get_price_snapshot",
    {
      description:
        "Get the current price snapshot (list price, trailing averages, price signal, sources, confidence) for one card by its catalog ID.",
      inputSchema: z.object({ cardId: z.string().min(1) }),
      outputSchema: toolResultSchema(PriceSnapshot),
    },
    async ({ cardId }) => {
      const result = await getPriceSnapshot(cardId);
      return {
        content: [
          {
            type: "text",
            text: result.ok
              ? `Price signal: ${result.data.priceSignal.label}.`
              : `Price lookup failed: ${result.reason}`,
          },
        ],
        structuredContent: result,
        isError: !result.ok,
      };
    },
  );
}
