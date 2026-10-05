import { describe, expect, it } from "vitest";
import { computeConfidence } from "./confidence";
import type { PriceSource } from "@/lib/schemas";

const now = new Date().toISOString();
const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();

describe("computeConfidence", () => {
  it("is 1.0 for two fresh sources and no quality flags", () => {
    const sources: PriceSource[] = [
      { provider: "cardmarket", currency: "EUR", listPrice: 10, lastUpdated: now },
      { provider: "tcgplayer", currency: "USD", listPrice: 11, lastUpdated: now },
    ];
    expect(computeConfidence(sources, [])).toBe(1);
  });

  it("penalizes a single price source", () => {
    const sources: PriceSource[] = [
      { provider: "cardmarket", currency: "EUR", listPrice: 10, lastUpdated: now },
    ];
    expect(computeConfidence(sources, [])).toBeCloseTo(0.7);
  });

  it("penalizes stale data (>24h since freshest source)", () => {
    const sources: PriceSource[] = [
      { provider: "cardmarket", currency: "EUR", listPrice: 10, lastUpdated: twoDaysAgo },
      { provider: "tcgplayer", currency: "USD", listPrice: 11, lastUpdated: twoDaysAgo },
    ];
    expect(computeConfidence(sources, [])).toBeCloseTo(0.8);
  });

  it("never goes below 0 even with many quality flags", () => {
    const sources: PriceSource[] = [];
    expect(computeConfidence(sources, ["missing", "stale", "conflicting", "incomplete"])).toBe(0);
  });

  it("never exceeds 1", () => {
    const sources: PriceSource[] = [
      { provider: "cardmarket", currency: "EUR", listPrice: 10, lastUpdated: now },
      { provider: "tcgplayer", currency: "USD", listPrice: 11, lastUpdated: now },
    ];
    expect(computeConfidence(sources, [])).toBeLessThanOrEqual(1);
  });
});
