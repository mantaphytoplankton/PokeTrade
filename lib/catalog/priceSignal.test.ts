import { describe, expect, it } from "vitest";
import { computePriceSignal } from "./priceSignal";
import type { PriceSource } from "@/lib/schemas";

const now = new Date().toISOString();

function source(overrides: Partial<PriceSource>): PriceSource {
  return {
    provider: "cardmarket",
    currency: "EUR",
    lastUpdated: now,
    ...overrides,
  };
}

describe("computePriceSignal", () => {
  it("returns red 'No price' when no source has a price", () => {
    const result = computePriceSignal([source({ listPrice: undefined })]);
    expect(result.value).toBe("red");
    expect(result.label).toBe("No price");
  });

  it("returns yellow when there is no trailing average to judge stability against", () => {
    const result = computePriceSignal([
      source({ provider: "tcgplayer", currency: "USD", listPrice: 10 }),
    ]);
    expect(result.value).toBe("yellow");
  });

  it("returns green when two sources agree and price is close to the 7-day average", () => {
    const result = computePriceSignal([
      source({ listPrice: 100, avg7: 98 }),
      source({ provider: "tcgplayer", currency: "USD", listPrice: 105 }),
    ]);
    expect(result.value).toBe("green");
  });

  it("returns yellow when only one provider reports a price, even if stable", () => {
    const result = computePriceSignal([source({ listPrice: 100, avg7: 100 })]);
    expect(result.value).toBe("yellow");
  });

  it("returns yellow when deviation from the 7-day average is moderate (10-30%)", () => {
    const result = computePriceSignal([
      source({ listPrice: 120, avg7: 100 }),
      source({ provider: "tcgplayer", currency: "USD", listPrice: 121 }),
    ]);
    expect(result.value).toBe("yellow");
  });

  it("returns red when deviation from the 7-day average exceeds 30%", () => {
    const result = computePriceSignal([
      source({ listPrice: 200, avg7: 100 }),
      source({ provider: "tcgplayer", currency: "USD", listPrice: 199 }),
    ]);
    expect(result.value).toBe("red");
  });

  it("returns red when cross-provider prices conflict by more than 25% (currency-normalized)", () => {
    const result = computePriceSignal([
      source({ listPrice: 100, avg7: 100 }), // ~108 USD after EUR->USD
      source({ provider: "tcgplayer", currency: "USD", listPrice: 500 }),
    ]);
    expect(result.value).toBe("red");
  });

  it("falls back to avg30 when avg7 is unavailable", () => {
    const result = computePriceSignal([
      source({ listPrice: 100, avg30: 100 }),
      source({ provider: "tcgplayer", currency: "USD", listPrice: 101 }),
    ]);
    expect(result.value).toBe("green");
  });
});
