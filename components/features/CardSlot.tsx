import Link from "next/link";
import { Suspense } from "react";
import type { CollectionEntry } from "@/lib/schemas";
import { CardThumb } from "@/components/ui/CardThumb";
import { PriceChip, PriceChipSkeleton } from "./PriceChip";

export function CardSlot({ entry }: { entry: CollectionEntry }) {
  return (
    <Link
      href={`/cards/${entry.entryId}`}
      className="flex flex-col gap-2 p-3 bg-paper-raised border-[2.5px] border-ink rounded-card shadow-[0_4px_0_0_rgba(36,31,61,0.15)] hover:-translate-y-0.5 transition-transform motion-reduce:transition-none no-underline text-ink"
    >
      <CardThumb
        name={entry.name}
        userPhotoUrl={entry.userPhotoUrl}
        catalogImageUrl={entry.catalogImageUrl}
        size={200}
        rare={/rare|holo/i.test(entry.rarity ?? "")}
      />
      <div className="font-extrabold text-[0.9375rem]">{entry.name}</div>
      <div className="text-[0.8125rem] text-ink-soft">
        {entry.setName || entry.setCode} · {entry.number} {entry.rarity ? `· ${entry.rarity}` : ""}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-data text-[0.8125rem] text-ink-soft tabular-nums">
          Qty {entry.quantity} · {entry.condition}
        </span>
      </div>
      <Suspense fallback={<PriceChipSkeleton />}>
        <PriceChip cardId={entry.cardId} />
      </Suspense>
    </Link>
  );
}
