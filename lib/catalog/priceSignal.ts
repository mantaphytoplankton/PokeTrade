import "server-only";
import type { PriceSignalResult, PriceSource } from "@/lib/schemas";
import { hasCrossProviderConflict } from "./dataQuality";

const RED_NO_PRICE: PriceSignalResult = {
  value: "red",
  label: "No price",
  description: "No provider has current pricing.",
};
const RED_CONFLICT: PriceSignalResult = {
  value: "red",
  label: "Outlier",
  description: "Outlier / unreliable / conflicting sources.",
};
const YELLOW_VOLATILE: PriceSignalResult = {
  value: "yellow",
  label: "Volatile",
  description: "Volatile or incomplete data.",
};
const GREEN_STABLE: PriceSignalResult = {
  value: "green",
  label: "Stable",
  description: "Close to the 7-day average.",
};

// See specs/mcp/mcp-design.md §7 for the reasoning behind these thresholds —
// starting points to calibrate against real price history, not derived
// constants.
export function computePriceSignal(sources: PriceSource[]): PriceSignalResult {
  const withPrice = sources.filter((s) => s.listPrice != null);
  if (withPrice.length === 0) return RED_NO_PRICE;

  const listPrice = withPrice[0].listPrice as number;
  const trendSource = sources.find((s) => s.avg7 != null) ?? sources.find((s) => s.avg30 != null);
  const trailing = trendSource?.avg7 ?? trendSource?.avg30;

  if (trailing == null) return YELLOW_VOLATILE;

  const deviation = Math.abs(listPrice - trailing) / trailing;

  if (hasCrossProviderConflict(sources)) return RED_CONFLICT;
  if (deviation > 0.3) return RED_CONFLICT;
  if (deviation > 0.1) return YELLOW_VOLATILE;
  if (withPrice.length < 2) return YELLOW_VOLATILE;
  return GREEN_STABLE;
}
