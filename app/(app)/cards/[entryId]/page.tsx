import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { readJson } from "@/lib/persistence/atomicWrite";
import { userCollectionPath } from "@/lib/persistence/paths";
import type { CollectionEntry } from "@/lib/schemas";
import { getPriceSnapshot } from "@/lib/catalog/price";
import { CardThumb } from "@/components/ui/CardThumb";
import { Chip } from "@/components/ui/Chip";
import { ButtonLink } from "@/components/ui/Button";
import { BackIcon } from "@/components/ui/icons";
import { EscapeToBack } from "@/components/features/EscapeToBack";
import { RemoveCardButton } from "@/components/features/RemoveCardButton";

export default async function CardDetailsPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const userId = await getCurrentUserId();
  const collection = (await readJson<CollectionEntry[]>(userCollectionPath(userId!))) ?? [];
  const entry = collection.find((c) => c.entryId === entryId);

  return (
    <div>
      <EscapeToBack href="/dashboard" />
      <Link href="/dashboard" className="inline-flex items-center gap-1 font-bold no-underline text-ink mb-6">
        <BackIcon className="w-[18px] h-[18px]" />
        Back to collection
      </Link>

      {!entry ? (
        <div className="border-2 border-dashed border-ink-soft rounded-card p-8 text-center text-ink-soft max-w-md">
          We couldn&apos;t find that card in your collection. It may have been removed.
        </div>
      ) : (
        <CardDetailsBody entry={entry} />
      )}
    </div>
  );
}

async function CardDetailsBody({ entry }: { entry: CollectionEntry }) {
  const priceResult = await getPriceSnapshot(entry.cardId);

  return (
    <>
      <div className="flex gap-6 flex-wrap mb-8">
        <CardThumb
          name={entry.name}
          userPhotoUrl={entry.userPhotoUrl}
          catalogImageUrl={entry.catalogImageUrl}
          size={220}
          rare={/rare|holo/i.test(entry.rarity ?? "")}
        />
        <div className="flex-1 min-w-[240px]">
          <h1 className="font-display text-2xl">{entry.name}</h1>
          <p className="text-ink-soft mb-3">
            {entry.setName || entry.setCode} · {entry.number} {entry.rarity ? `· ${entry.rarity}` : ""}
          </p>
          {priceResult.ok ? (
            <Chip
              signal={priceResult.data.priceSignal.value}
              label={priceResult.data.priceSignal.label}
              description={priceResult.data.priceSignal.description}
            />
          ) : (
            <Chip signal="red" label="No price" description="Couldn't reach the catalog for this card." />
          )}

          <div className="mt-6">
            <h2 className="font-display text-lg mb-2">Price history</h2>
            {priceResult.ok && priceResult.data.sources.length > 0 ? (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm max-w-xs">
                {priceResult.data.sources.map((source) => (
                  <PriceSourceRows key={source.provider} source={source} />
                ))}
              </dl>
            ) : (
              <p className="text-ink-soft text-sm">No price history available for this card yet.</p>
            )}
            <p className="text-xs text-ink-soft mt-2">
              {priceResult.ok
                ? `Updated ${new Date(priceResult.data.fetchedAt).toLocaleString()} · confidence ${Math.round(priceResult.data.confidence * 100)}%`
                : "Unavailable"}
            </p>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm mb-8 max-w-sm">
        <dt className="font-bold text-ink-soft">Condition</dt>
        <dd className="font-data">{entry.condition}</dd>
        <dt className="font-bold text-ink-soft">Quantity</dt>
        <dd className="font-data">{entry.quantity}</dd>
      </dl>

      <div className="flex gap-3 flex-wrap">
        <ButtonLink href="/trade" variant="secondary">
          Analyze in a trade
        </ButtonLink>
        <RemoveCardButton entryId={entry.entryId} cardName={entry.name} />
      </div>
      <p className="text-[0.8125rem] text-ink-soft mt-3">Press Escape to go back to your collection.</p>
    </>
  );
}

function PriceSourceRows({
  source,
}: {
  source: { provider: string; currency: string; listPrice?: number; avg1?: number; avg7?: number; avg30?: number; lastUpdated: string };
}) {
  const symbol = source.currency === "EUR" ? "€" : "$";
  return (
    <>
      <dt className="font-bold text-ink-soft capitalize">{source.provider}</dt>
      <dd className="font-data tabular-nums">
        {source.listPrice != null ? `${symbol}${source.listPrice.toFixed(2)}` : "—"}
        {source.avg7 != null ? ` · 7d avg ${symbol}${source.avg7.toFixed(2)}` : ""}
        {source.avg30 != null ? ` · 30d avg ${symbol}${source.avg30.toFixed(2)}` : ""}
      </dd>
    </>
  );
}
