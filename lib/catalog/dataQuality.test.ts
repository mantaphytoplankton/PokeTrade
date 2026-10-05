import { describe, expect, it } from "vitest";
import { computeQualityFlags, hasCrossProviderConflict } from "./dataQuality";
import type { PriceSource } from "@/lib/schemas";

const now = new Date().toISOString();
const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();

describe("computeQualityFlags", () => {
  it("flags 'missing' when no source has a price", () => {
    const flags = computeQualityFlags([
      { provider: "cardmarket", currency: "EUR", lastUpdated: now },
    ]);
    expect(flags).toContain("missing");
  });

  it("flags 'stale' when the freshest source is older than 24h", () => {
    const flags = computeQualityFlags([
      { provider: "cardmarket", currency: "EUR", listPrice: 10, avg7: 10, lastUpdated: twoDaysAgo },
    ]);
    expect(flags).toContain("stale");
  });

  it("does not flag 'stale' when a source is fresh", () => {
    const flags = computeQualityFlags([
      { provider: "cardmarket", currency: "EUR", listPrice: 10, avg7: 10, lastUpdated: now },
    ]);
    expect(flags).not.toContain("stale");
  });

  it("flags 'incomplete' when no source has trailing averages", () => {
    const flags = computeQualityFlags([
      { provider: "tcgplayer", currency: "USD", listPrice: 10, lastUpdated: now },
    ]);
    expect(flags).toContain("incomplete");
  });

  it("flags 'conflicting' when cross-provider prices diverge over 25%", () => {
    const flags = computeQualityFlags([
      { provider: "cardmarket", currency: "EUR", listPrice: 100, avg7: 100, lastUpdated: now },
      { provider: "tcgplayer", currency: "USD", listPrice: 500, lastUpdated: now },
    ]);
    expect(flags).toContain("conflicting");
  });

  it("returns no flags for two fresh, agreeing, complete sources", () => {
    const flags = computeQualityFlags([
      { provider: "cardmarket", currency: "EUR", listPrice: 100, avg7: 100, lastUpdated: now },
      { provider: "tcgplayer", currency: "USD", listPrice: 108, lastUpdated: now },
    ]);
    expect(flags).toEqual([]);
  });
});

describe("hasCrossProviderConflict", () => {
  it("is false when only one provider has a price", () => {
    const sources: PriceSource[] = [
      { provider: "cardmarket", currency: "EUR", listPrice: 100, lastUpdated: now },
    ];
    expect(hasCrossProviderConflict(sources)).toBe(false);
  });
});
