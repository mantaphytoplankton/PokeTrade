import { z } from "zod";

// Shared contracts — see specs/architecture-design.md §5 and
// specs/mcp/mcp-design.md §5.1. One source of truth consumed by lib/catalog,
// the MCP tool layer, Server Actions, and the UI.

export const Signal = z.enum(["green", "yellow", "red"]);
export type Signal = z.infer<typeof Signal>;

export const DataQualityFlag = z.enum([
  "stale",
  "missing",
  "conflicting",
  "incomplete",
]);
export type DataQualityFlag = z.infer<typeof DataQualityFlag>;

export const CardIdentity = z.object({
  cardId: z.string(),
  name: z.string(),
  setCode: z.string(),
  setName: z.string(),
  number: z.string(),
  language: z.string(),
  rarity: z.string().optional(),
  images: z
    .object({
      small: z.string().url().optional(),
      large: z.string().url().optional(),
    })
    .optional(),
});
export type CardIdentity = z.infer<typeof CardIdentity>;

export const PriceSource = z.object({
  provider: z.enum(["tcgplayer", "cardmarket"]),
  currency: z.string(),
  listPrice: z.number().optional(),
  lastSale: z.number().optional(),
  avg1: z.number().optional(),
  avg7: z.number().optional(),
  avg30: z.number().optional(),
  lastUpdated: z.string(),
});
export type PriceSource = z.infer<typeof PriceSource>;

export const PriceSignalResult = z.object({
  value: Signal,
  label: z.string(),
  description: z.string(),
});
export type PriceSignalResult = z.infer<typeof PriceSignalResult>;

export const PriceSnapshot = z.object({
  cardId: z.string(),
  sources: z.array(PriceSource),
  priceSignal: PriceSignalResult,
  confidence: z.number().min(0).max(1),
  qualityFlags: z.array(DataQualityFlag),
  fetchedAt: z.string(),
});
export type PriceSnapshot = z.infer<typeof PriceSnapshot>;

// Every catalog operation returns this envelope so a failure is data, not a
// thrown exception — see mcp-design.md §5.1 / §9.
export const ToolFailureReason = z.enum([
  "not_found",
  "provider_timeout",
  "provider_error",
  "invalid_input",
]);
export type ToolFailureReason = z.infer<typeof ToolFailureReason>;

export function toolResultSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion("ok", [
    z.object({ ok: z.literal(true), data: dataSchema }),
    z.object({
      ok: z.literal(false),
      reason: ToolFailureReason,
      message: z.string(),
    }),
  ]);
}

export type ToolResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: ToolFailureReason; message: string };

// ---------------------------------------------------------------------------
// Account / collection forms (app-design.md)
// ---------------------------------------------------------------------------

export const CollectorLevel = z.enum(["new", "collector", "pro"]);
export type CollectorLevel = z.infer<typeof CollectorLevel>;

export const RegisterInput = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  collectorLevel: CollectorLevel,
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export const LoginInput = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const CardCondition = z.enum([
  "Near Mint",
  "Lightly Played",
  "Moderately Played",
  "Damaged",
]);
export type CardCondition = z.infer<typeof CardCondition>;

export const AddCardInput = z.object({
  cardId: z.string().min(1),
  name: z.string().min(1),
  setCode: z.string().min(1),
  setName: z.string().min(1),
  number: z.string().min(1),
  language: z.string().min(1),
  rarity: z.string().optional(),
  imageUrl: z.string().url().optional(),
  condition: CardCondition,
  quantity: z.coerce.number().int().min(1).max(999),
});
export type AddCardInput = z.infer<typeof AddCardInput>;

export const CollectionEntry = z.object({
  entryId: z.string(),
  cardId: z.string(),
  name: z.string(),
  setCode: z.string(),
  setName: z.string(),
  number: z.string(),
  language: z.string(),
  rarity: z.string().optional(),
  catalogImageUrl: z.string().url().optional(),
  userPhotoUrl: z.string().optional(),
  condition: CardCondition,
  quantity: z.number().int().min(1),
  addedAt: z.string(),
});
export type CollectionEntry = z.infer<typeof CollectionEntry>;
