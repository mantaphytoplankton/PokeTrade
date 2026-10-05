import "server-only";
import type { ToolFailureReason } from "@/lib/schemas";
import { ProviderError, ProviderTimeoutError } from "./client";

export function mapCatalogError(err: unknown): { ok: false; reason: ToolFailureReason; message: string } {
  if (err instanceof ProviderTimeoutError) {
    return { ok: false, reason: "provider_timeout", message: err.message };
  }
  if (err instanceof ProviderError) {
    if (err.status === 404) return { ok: false, reason: "not_found", message: err.message };
    return { ok: false, reason: "provider_error", message: err.message };
  }
  return {
    ok: false,
    reason: "provider_error",
    message: err instanceof Error ? err.message : "Unknown catalog error",
  };
}
