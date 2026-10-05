import "server-only";

const BASE_URL = "https://api.tcgdex.net/v2";
const LANGUAGE = "en";
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 1;

export class ProviderTimeoutError extends Error {}
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

async function fetchOnce(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}/${LANGUAGE}${path}`, {
      signal: controller.signal,
      // TCGdex data changes slowly; our own cache.ts owns the TTL policy on
      // top of this, so don't let Next.js's fetch cache add a second,
      // invisible layer of staleness.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new ProviderError(`TCGdex ${path} returned HTTP ${res.status}`, res.status);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ProviderTimeoutError(`TCGdex ${path} timed out after ${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchTcgdex(path: string): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchOnce(path);
    } catch (err) {
      lastError = err;
      // Don't retry a 4xx (e.g. not-found) — it will fail again identically.
      if (err instanceof ProviderError && err.status && err.status < 500) throw err;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
      }
    }
  }
  throw lastError;
}
