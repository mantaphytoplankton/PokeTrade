import { getCurrentUserId } from "@/lib/auth/currentUser";
import { readJson } from "@/lib/persistence/atomicWrite";
import { userCollectionPath } from "@/lib/persistence/paths";
import type { CollectionEntry } from "@/lib/schemas";
import { sortEntriesByName, type SortDirection } from "@/lib/collection/sortByName";
import { CardSlot } from "@/components/features/CardSlot";
import { FilterBar } from "@/components/features/FilterBar";
import { FlashToast } from "@/components/ui/Toast";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const userId = await getCurrentUserId();
  const collection = (await readJson<CollectionEntry[]>(userCollectionPath(userId!))) ?? [];

  const sets = [...new Set(collection.map((c) => c.setName || c.setCode))].sort();
  const rarities = [...new Set(collection.map((c) => c.rarity).filter((r): r is string => Boolean(r)))].sort();
  const languages = [...new Set(collection.map((c) => c.language))].sort();

  const filtered = collection.filter((c) => {
    if (sp.set && c.setName !== sp.set && c.setCode !== sp.set) return false;
    if (sp.rarity && c.rarity !== sp.rarity) return false;
    if (sp.language && c.language !== sp.language) return false;
    return true;
  });

  // Sort only ever reorders the already-filtered subset (COLL-04) — it never
  // changes which cards are shown, so it composes with any filter combination.
  const sortDirection: SortDirection = sp.sort === "asc" || sp.sort === "desc" ? sp.sort : null;
  const sorted = sortEntriesByName(filtered, sortDirection);

  return (
    <div>
      <h1 className="font-display text-2xl mb-4">My collection</h1>

      {collection.length === 0 ? (
        <div className="border-2 border-dashed border-ink-soft rounded-card p-8 text-center text-ink-soft max-w-md">
          Your binder&apos;s empty — search for your first card.
        </div>
      ) : (
        <>
          <FilterBar sets={sets} rarities={rarities} languages={languages} />
          {sorted.length === 0 ? (
            <div className="border-2 border-dashed border-ink-soft rounded-card p-8 text-center text-ink-soft max-w-md">
              No cards match these filters.
            </div>
          ) : (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
              {sorted.map((entry) => (
                <CardSlot key={entry.entryId} entry={entry} />
              ))}
            </div>
          )}
        </>
      )}

      <FlashToast initialMessage={sp.flash} />
    </div>
  );
}
