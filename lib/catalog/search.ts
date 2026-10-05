import "server-only";
import type { CardIdentity, ToolResult } from "@/lib/schemas";
import { fetchTcgdex } from "./client";
import { mapCatalogError } from "./errors";
import { normalizeIdentity, type RawSearchResult } from "./normalize";

export async function searchCards(
  query: string,
  opts: { limit?: number } = {},
): Promise<ToolResult<CardIdentity[]>> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid_input", message: "Search query must not be empty." };
  }
  const limit = Math.min(opts.limit ?? 20, 50);

  try {
    const raw = (await fetchTcgdex(`/cards?name=${encodeURIComponent(trimmed)}`)) as RawSearchResult[];
    const identities = raw.slice(0, limit).map((r) => normalizeIdentity(r));
    return { ok: true, data: identities };
  } catch (err) {
    return mapCatalogError(err);
  }
}
