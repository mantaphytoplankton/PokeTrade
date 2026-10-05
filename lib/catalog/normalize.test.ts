import { describe, expect, it } from "vitest";
import { normalizeIdentity, normalizePriceSources, type RawCardDetail, type RawSearchResult } from "./normalize";

// Fixtures below mirror real TCGdex responses captured against the live API
// (base1-4 / Charizard, base1-44 / Bulbasaur) — see specs/mcp/mcp-design.md.

describe("normalizeIdentity", () => {
  it("normalizes a search result (no set object, no rarity)", () => {
    const raw: RawSearchResult = {
      id: "base1-4",
      localId: "4",
      name: "Charizard",
      image: "https://assets.tcgdex.net/en/base/base1/4",
    };
    const identity = normalizeIdentity(raw);
    expect(identity).toEqual({
      cardId: "base1-4",
      name: "Charizard",
      setCode: "base1",
      setName: "",
      number: "4",
      language: "en",
      rarity: undefined,
      images: {
        small: "https://assets.tcgdex.net/en/base/base1/4/low.webp",
        large: "https://assets.tcgdex.net/en/base/base1/4/high.webp",
      },
    });
  });

  it("normalizes a full card detail, using the embedded set object", () => {
    const raw: RawCardDetail = {
      id: "base1-4",
      localId: "4",
      name: "Charizard",
      rarity: "Rare",
      image: "https://assets.tcgdex.net/en/base/base1/4",
      set: { id: "base1", name: "Base Set" },
    };
    const identity = normalizeIdentity(raw);
    expect(identity.setCode).toBe("base1");
    expect(identity.setName).toBe("Base Set");
    expect(identity.rarity).toBe("Rare");
  });

  it("handles a card with no image", () => {
    const raw: RawSearchResult = { id: "2024sv-2", localId: "2", name: "Pikachu" };
    expect(normalizeIdentity(raw).images).toBeUndefined();
  });
});

describe("normalizePriceSources", () => {
  it("normalizes both providers from a real Charizard-shaped payload", () => {
    const sources = normalizePriceSources({
      cardmarket: {
        updated: "2026-07-28T08:03:04.203Z",
        unit: "EUR",
        avg: 446.7,
        trend: 350.99,
        avg1: 285,
        avg7: 286.21,
        avg30: 457.43,
      },
      tcgplayer: {
        unit: "USD",
        updated: "2026-07-28T08:03:01.378Z",
        holofoil: {
          productId: 42382,
          lowPrice: 510,
          midPrice: 919.49,
          highPrice: 4590.63,
          marketPrice: 800.43,
          directLowPrice: 612.06,
        },
      },
    });

    expect(sources).toHaveLength(2);
    const cardmarket = sources.find((s) => s.provider === "cardmarket")!;
    expect(cardmarket.listPrice).toBe(350.99);
    expect(cardmarket.avg7).toBe(286.21);
    expect(cardmarket.currency).toBe("EUR");

    const tcgplayer = sources.find((s) => s.provider === "tcgplayer")!;
    expect(tcgplayer.listPrice).toBe(800.43);
    expect(tcgplayer.currency).toBe("USD");
    expect(tcgplayer.avg7).toBeUndefined();
  });

  it("prefers holofoil over normal when both variants are present", () => {
    const sources = normalizePriceSources({
      tcgplayer: {
        unit: "USD",
        updated: "2026-01-01T00:00:00Z",
        normal: { marketPrice: 1 },
        holofoil: { marketPrice: 99 },
      },
    });
    expect(sources[0].listPrice).toBe(99);
  });

  it("falls back to the normal variant when no holo variant exists", () => {
    const sources = normalizePriceSources({
      tcgplayer: {
        unit: "USD",
        updated: "2026-01-01T00:00:00Z",
        normal: { marketPrice: 4.7 },
      },
    });
    expect(sources[0].listPrice).toBe(4.7);
  });

  it("returns an empty array when pricing is undefined", () => {
    expect(normalizePriceSources(undefined)).toEqual([]);
  });

  it("skips a null provider block (TCGdex returns null, not absent, for some variants)", () => {
    const sources = normalizePriceSources({ cardmarket: null, tcgplayer: null });
    expect(sources).toEqual([]);
  });
});
