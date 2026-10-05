import { getPriceSnapshot } from "@/lib/catalog/price";
import { Chip } from "@/components/ui/Chip";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// Async Server Component: rendered inside a <Suspense> per card so one
// slow/failed price lookup never blocks the rest of the grid from painting
// (PERF-01) and one provider failure stays isolated to this card (DQ-04).
export async function PriceChip({ cardId }: { cardId: string }) {
  const result = await getPriceSnapshot(cardId);

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-1">
        <Chip signal="red" label="No price" description="Couldn't reach the catalog for this card." />
      </div>
    );
  }

  const { priceSignal, sources, fetchedAt } = result.data;
  const listPrice = sources.find((s) => s.listPrice != null);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-data font-semibold text-base tabular-nums">
          {listPrice ? `${listPrice.currency === "EUR" ? "€" : "$"}${listPrice.listPrice!.toFixed(2)}` : "—"}
        </span>
      </div>
      <Chip signal={priceSignal.value} label={priceSignal.label} description={priceSignal.description} />
      <span className="text-xs text-ink-soft">Updated {timeAgo(fetchedAt)}</span>
    </div>
  );
}

export function PriceChipSkeleton() {
  return (
    <div className="flex flex-col gap-1 animate-pulse motion-reduce:animate-none">
      <div className="h-5 w-16 bg-neutral-100 rounded" />
      <div className="h-6 w-24 bg-neutral-100 rounded-pill" />
    </div>
  );
}
