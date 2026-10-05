import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { withCache } from "./cache";

describe("withCache", () => {
  let dir: string;
  let filePath: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "poketrade-cache-"));
    filePath = path.join(dir, "entry.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("calls fetchFn on a cold cache and persists the result", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ value: 1 });
    const result = await withCache(filePath, 60_000, fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: { value: 1 }, fetchedAt: result.fetchedAt, stale: false });
  });

  it("serves from cache within the TTL without calling fetchFn again", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ value: 1 });
    await withCache(filePath, 60_000, fetchFn);
    const second = await withCache(filePath, 60_000, fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(second.stale).toBe(false);
  });

  it("re-fetches once the TTL has elapsed", async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce({ value: 1 }).mockResolvedValueOnce({ value: 2 });
    await withCache(filePath, 1, fetchFn); // 1ms TTL
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await withCache(filePath, 1, fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(second.data).toEqual({ value: 2 });
  });

  it("serves the last-known-good value, flagged stale, when a re-fetch fails after TTL expiry", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ value: 1 })
      .mockRejectedValueOnce(new Error("upstream down"));
    await withCache(filePath, 1, fetchFn);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await withCache(filePath, 1, fetchFn);
    expect(second.stale).toBe(true);
    expect(second.data).toEqual({ value: 1 });
  });

  it("throws when there is no cached value and the fetch fails (nothing to fall back to)", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("upstream down"));
    await expect(withCache(filePath, 60_000, fetchFn)).rejects.toThrow("upstream down");
  });
});
