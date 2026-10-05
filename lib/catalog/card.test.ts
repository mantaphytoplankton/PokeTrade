import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const charizardFixture = {
  id: "base1-4",
  localId: "4",
  name: "Charizard",
  rarity: "Rare",
  image: "https://assets.tcgdex.net/en/base/base1/4",
  set: { id: "base1", name: "Base Set" },
  pricing: {
    cardmarket: {
      updated: "2026-07-28T08:03:04.203Z",
      unit: "EUR",
      trend: 350.99,
      avg7: 286.21,
      avg30: 457.43,
    },
    tcgplayer: {
      unit: "USD",
      updated: "2026-07-28T08:03:01.378Z",
      holofoil: { marketPrice: 800.43 },
    },
  },
};

describe("getCard (integration, fixture-backed, isolated data dir)", () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "poketrade-catalog-"));
    process.env.POKETRADE_DATA_ROOT = dataDir;
    vi.resetModules();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    delete process.env.POKETRADE_DATA_ROOT;
    await rm(dataDir, { recursive: true, force: true });
  });

  it("returns a normalized identity and price snapshot on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(charizardFixture)));
    const { getCard } = await import("./card");

    const result = await getCard("base1-4");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.identity.name).toBe("Charizard");
      expect(result.data.price.sources).toHaveLength(2);
      expect(result.data.price.priceSignal.value).toBeDefined();
    }
  });

  it("returns not_found for a 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "not found" }, 404)));
    const { getCard } = await import("./card");

    const result = await getCard("does-not-exist");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not_found");
  });

  it("serves from cache on a second call within the TTL, without a second fetch", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse(charizardFixture));
    vi.stubGlobal("fetch", fetchSpy);
    const { getCard } = await import("./card");

    await getCard("base1-4");
    await getCard("base1-4");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("fetchedAt reflects the real fetch time, never 'now' at read time", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(charizardFixture)));
    const { getCard } = await import("./card");

    const before = Date.now();
    const result = await getCard("base1-4");
    const after = Date.now();
    expect(result.ok).toBe(true);
    if (result.ok) {
      const fetchedAtMs = new Date(result.data.price.fetchedAt).getTime();
      expect(fetchedAtMs).toBeGreaterThanOrEqual(before);
      expect(fetchedAtMs).toBeLessThanOrEqual(after);
    }
  });

  it("rejects an empty cardId without hitting the network", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { getCard } = await import("./card");

    const result = await getCard("   ");
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
