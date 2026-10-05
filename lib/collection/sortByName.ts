export type SortDirection = "asc" | "desc" | null;

// sensitivity: 'base' treats case and accents as equal (COLL-04: "Flabébé"
// and "Flabebe" sort the same way a person alphabetizing by hand would).
const collator = new Intl.Collator(undefined, { sensitivity: "base" });

// Array.prototype.sort is stable in all engines Next.js targets, so
// same-named entries keep their existing relative order in both directions
// — comparing with swapped arguments for "desc" (not sorting ascending then
// reversing) is what preserves that stability; reversing would also flip
// the order of ties, which is the one thing COLL-04 says must not happen.
export function sortEntriesByName<T extends { name: string }>(
  entries: T[],
  direction: SortDirection,
): T[] {
  if (!direction) return entries;
  const sorted = [...entries];
  if (direction === "asc") {
    sorted.sort((a, b) => collator.compare(a.name, b.name));
  } else {
    sorted.sort((a, b) => collator.compare(b.name, a.name));
  }
  return sorted;
}
