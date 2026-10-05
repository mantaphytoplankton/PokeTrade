import "server-only";
import path from "node:path";
import type { CardIdentity, PriceSnapshot, ToolResult } from "@/lib/schemas";
import { cacheDir } from "@/lib/persistence/paths";
import { withCache } from "./cache";
import { fetchTcgdex } from "./client";
import { computeConfidence } from "./confidence";
import { computeQualityFlags } from "./dataQuality";
import { mapCatalogError } from "./errors";
import { normalizeIdentity, normalizePriceSources, type RawCardDetail } from "./normalize";
import { computePriceSignal } from "./priceSignal";

// TCGdex returns identity and pricing in one payload (no separate pricing
// endpoint), so this cache uses the shorter, price-appropriate TTL for the
// whole response rather than splitting metadata/price into two fetches —
// a deliberate simplification against specs/mcp/mcp-design.md §8's two-table
// TTL split, which assumed independently fetchable resources. Errs toward
// re-fetching metadata more often than strictly necessary, never toward
// serving prices staler than intended.
const CARD_CACHE_TTL_MS = 15 * 60 * 1000;

export interface CardWithPrice {
  identity: CardIdentity;
  price: PriceSnapshot;
}

export async function getCard(cardId: string): Promise<ToolResult<CardWithPrice>> {
  const trimmed = cardId.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid_input", message: "cardId must not be empty." };
  }

  try {
    const cacheFile = path.join(cacheDir("cards"), `${trimmed}.json`);
    const { data: raw, fetchedAt } = await withCache(cacheFile, CARD_CACHE_TTL_MS, async () => {
      return (await fetchTcgdex(`/cards/${encodeURIComponent(trimmed)}`)) as RawCardDetail;
    });

    const identity = normalizeIdentity(raw);
    const sources = normalizePriceSources(raw.pricing);
    const qualityFlags = computeQualityFlags(sources);
    const priceSignal = computePriceSignal(sources);
    const confidence = computeConfidence(sources, qualityFlags);

    const price: PriceSnapshot = {
      cardId: identity.cardId,
      sources,
      priceSignal,
      confidence,
      qualityFlags,
      fetchedAt,
    };

    return { ok: true, data: { identity, price } };
  } catch (err) {
    return mapCatalogError(err);
  }
}
