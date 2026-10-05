import "server-only";
import { atomicWriteJson, readJson } from "@/lib/persistence/atomicWrite";

interface CacheEntry<T> {
  data: T;
  fetchedAt: string;
}

export interface CacheResult<T> {
  data: T;
  fetchedAt: string;
  stale: boolean;
}

// File-based TTL cache (see specs/mcp/mcp-design.md §8). On a cache miss that
// then fails upstream, serves the last-known-good value flagged `stale`
// rather than failing the whole request — one provider hiccup should not
// take down the app (DQ-04).
export async function withCache<T>(
  filePath: string,
  ttlMs: number,
  fetchFn: () => Promise<T>,
): Promise<CacheResult<T>> {
  const cached = await readJson<CacheEntry<T>>(filePath);
  const now = Date.now();

  if (cached && now - Date.parse(cached.fetchedAt) < ttlMs) {
    return { data: cached.data, fetchedAt: cached.fetchedAt, stale: false };
  }

  try {
    const fresh = await fetchFn();
    const fetchedAt = new Date(now).toISOString();
    await atomicWriteJson(filePath, { data: fresh, fetchedAt } satisfies CacheEntry<T>);
    return { data: fresh, fetchedAt, stale: false };
  } catch (err) {
    if (cached) {
      return { data: cached.data, fetchedAt: cached.fetchedAt, stale: true };
    }
    throw err;
  }
}
