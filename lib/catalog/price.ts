import "server-only";
import type { PriceSnapshot, ToolResult } from "@/lib/schemas";
import { getCard } from "./card";

// Reuses getCard's cached fetch rather than issuing a second call — avoids
// unnecessary repeated provider calls (tech-spec.md Performance / PERF-03).
export async function getPriceSnapshot(cardId: string): Promise<ToolResult<PriceSnapshot>> {
  const result = await getCard(cardId);
  if (!result.ok) return result;
  return { ok: true, data: result.data.price };
}
