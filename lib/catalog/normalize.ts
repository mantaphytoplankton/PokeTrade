import "server-only";
import type { CardIdentity, PriceSource } from "@/lib/schemas";

// Shapes observed from the live TCGdex API (api.tcgdex.net/v2/en) — see
// specs/mcp/mcp-design.md and the smoke check in scripts/smoke.mjs. TCGdex
// has no published TypeScript types, so these are intentionally narrow,
// hand-verified interfaces, not a full API client's worth of types.

export interface RawSearchResult {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

export interface RawTcgplayerVariantPrice {
  productId?: number;
  lowPrice?: number;
  midPrice?: number;
  highPrice?: number;
  marketPrice?: number;
  directLowPrice?: number;
}

export interface RawPricing {
  cardmarket?: {
    updated?: string;
    unit?: string;
    avg?: number;
    trend?: number;
    avg1?: number;
    avg7?: number;
    avg30?: number;
  } | null;
  tcgplayer?: ({
    unit?: string;
    updated?: string;
  } & Record<string, RawTcgplayerVariantPrice | string | undefined>) | null;
}

export interface RawCardDetail extends RawSearchResult {
  rarity?: string;
  set: { id: string; name: string };
  pricing?: RawPricing;
}

export function normalizeIdentity(raw: RawSearchResult | RawCardDetail, setName?: string): CardIdentity {
  const set = "set" in raw ? raw.set : undefined;
  return {
    cardId: raw.id,
    name: raw.name,
    setCode: set?.id ?? deriveSetCodeFromId(raw.id),
    setName: set?.name ?? setName ?? "",
    number: raw.localId,
    language: "en",
    rarity: "rarity" in raw ? raw.rarity : undefined,
    images: raw.image
      ? { small: `${raw.image}/low.webp`, large: `${raw.image}/high.webp` }
      : undefined,
  };
}

// Search results don't include the set object, only the global card id
// (e.g. "base1-4"), so the set code is everything before the last hyphen.
function deriveSetCodeFromId(cardId: string): string {
  const idx = cardId.lastIndexOf("-");
  return idx === -1 ? cardId : cardId.slice(0, idx);
}

// TCGPlayer exposes one price per printing *variant* (normal, holofoil,
// reverseHolofoil, 1stEditionHolofoil, ...); PriceSnapshot is one entry per
// provider. We collapse to the single most representative variant rather
// than modeling every variant — a deliberate MVP-1 simplification, flagged
// in mcp-design.md §7, not an oversight.
const TCGPLAYER_VARIANT_PRIORITY = [
  "holofoil",
  "reverseHolofoil",
  "1stEditionHolofoil",
  "unlimitedHolofoil",
  "normal",
];

function pickTcgplayerVariant(
  tcgplayer: NonNullable<RawPricing["tcgplayer"]>,
): RawTcgplayerVariantPrice | undefined {
  for (const key of TCGPLAYER_VARIANT_PRIORITY) {
    const variant = tcgplayer[key];
    if (variant && typeof variant === "object") return variant;
  }
  return undefined;
}

export function normalizePriceSources(pricing: RawPricing | undefined): PriceSource[] {
  const sources: PriceSource[] = [];

  if (pricing?.cardmarket) {
    const cm = pricing.cardmarket;
    sources.push({
      provider: "cardmarket",
      currency: cm.unit ?? "EUR",
      listPrice: cm.trend ?? cm.avg,
      avg1: cm.avg1,
      avg7: cm.avg7,
      avg30: cm.avg30,
      lastUpdated: cm.updated ?? new Date(0).toISOString(),
    });
  }

  if (pricing?.tcgplayer) {
    const variant = pickTcgplayerVariant(pricing.tcgplayer);
    if (variant) {
      sources.push({
        provider: "tcgplayer",
        currency: pricing.tcgplayer.unit ?? "USD",
        listPrice: variant.marketPrice,
        lastUpdated: pricing.tcgplayer.updated ?? new Date(0).toISOString(),
      });
    }
  }

  return sources;
}
