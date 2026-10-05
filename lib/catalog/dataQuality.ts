import "server-only";
import type { DataQualityFlag, PriceSource } from "@/lib/schemas";

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

// Fixed approximation, not a live FX rate — this is a tunable placeholder
// like the thresholds below, flagged in specs/mcp/mcp-design.md §7 as
// something to calibrate once real data is flowing, not a measured constant.
const EUR_TO_USD = 1.08;

export function freshestTimestampMs(sources: PriceSource[]): number | null {
  return sources.reduce<number | null>((latest, s) => {
    const t = Date.parse(s.lastUpdated);
    if (Number.isNaN(t)) return latest;
    return latest == null ? t : Math.max(latest, t);
  }, null);
}

export function hasCrossProviderConflict(sources: PriceSource[]): boolean {
  const cardmarket = sources.find((s) => s.provider === "cardmarket" && s.listPrice != null);
  const tcgplayer = sources.find((s) => s.provider === "tcgplayer" && s.listPrice != null);
  if (!cardmarket || !tcgplayer) return false;

  const cmUsd =
    cardmarket.currency === "EUR" ? cardmarket.listPrice! * EUR_TO_USD : cardmarket.listPrice!;
  const tpUsd = tcgplayer.listPrice!;
  const deviation = Math.abs(cmUsd - tpUsd) / Math.max(cmUsd, tpUsd);
  return deviation > 0.25;
}

export function computeQualityFlags(sources: PriceSource[]): DataQualityFlag[] {
  const flags: DataQualityFlag[] = [];
  const withPrice = sources.filter((s) => s.listPrice != null);

  if (withPrice.length === 0) {
    flags.push("missing");
  } else {
    const freshest = freshestTimestampMs(sources);
    if (freshest == null || Date.now() - freshest > STALE_THRESHOLD_MS) {
      flags.push("stale");
    }
  }

  if (hasCrossProviderConflict(sources)) flags.push("conflicting");

  const hasTrailingAverage = sources.some((s) => s.avg7 != null || s.avg30 != null);
  if (!hasTrailingAverage) flags.push("incomplete");

  return flags;
}
