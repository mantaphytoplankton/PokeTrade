import "server-only";
import type { DataQualityFlag, PriceSource } from "@/lib/schemas";
import { freshestTimestampMs } from "./dataQuality";

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

// See specs/mcp/mcp-design.md §7. Deliberately simple, additive scoring —
// a heuristic starting point, not a calibrated model.
export function computeConfidence(
  sources: PriceSource[],
  qualityFlags: DataQualityFlag[],
): number {
  let score = 1;

  const withPrice = sources.filter((s) => s.listPrice != null);
  if (withPrice.length < 2) score -= 0.3;

  const freshest = freshestTimestampMs(sources);
  if (freshest == null || Date.now() - freshest > STALE_THRESHOLD_MS) score -= 0.2;

  score -= 0.2 * qualityFlags.length;

  return Math.max(0, Math.min(1, score));
}
