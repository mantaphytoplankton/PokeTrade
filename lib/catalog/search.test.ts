import { afterEach, describe, expect, it, vi } from "vitest";
import { searchCards } from "./search";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("searchCards (integration, fixture-backed)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an empty query without hitting the network", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const result = await searchCards("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid_input");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns normalized identities for a successful search", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse([
          { id: "base1-4", localId: "4", name: "Charizard", image: "https://assets.tcgdex.net/en/base/base1/4" },
        ]),
      ),
    );
    const result = await searchCards("Charizard");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].cardId).toBe("base1-4");
      expect(result.data[0].setCode).toBe("base1");
    }
  });

  it("returns an empty array (not an error) when nothing matches", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([])));
    const result = await searchCards("zzznonexistentcard");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual([]);
  });

  it("maps a provider 5xx error to a typed provider_error result, never throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "boom" }, 500)));
    const result = await searchCards("Pikachu");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("provider_error");
  });

  it("maps a network abort/timeout to a typed provider_timeout result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        const err = new DOMException("aborted", "AbortError");
        return Promise.reject(err);
      }),
    );
    const result = await searchCards("Pikachu");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("provider_timeout");
  });

  it("caps limit at 50 even if a larger limit is requested", async () => {
    const many = Array.from({ length: 80 }, (_, i) => ({
      id: `set-${i}`,
      localId: String(i),
      name: `Card ${i}`,
    }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(many)));
    const result = await searchCards("Card", { limit: 1000 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(50);
  });
});
