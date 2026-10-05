"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/Field";

export function FilterBar({
  sets,
  rarities,
  languages,
}: {
  sets: string[];
  rarities: string[];
  languages: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-3 flex-wrap mb-6" role="group" aria-label="Filter collection">
      <Select
        aria-label="Filter by set"
        value={searchParams.get("set") ?? ""}
        onChange={(e) => updateParam("set", e.target.value)}
        className="rounded-pill min-h-11 font-bold text-sm"
      >
        <option value="">Set: All</option>
        {sets.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filter by rarity"
        value={searchParams.get("rarity") ?? ""}
        onChange={(e) => updateParam("rarity", e.target.value)}
        className="rounded-pill min-h-11 font-bold text-sm"
      >
        <option value="">Rarity: All</option>
        {rarities.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filter by language"
        value={searchParams.get("language") ?? ""}
        onChange={(e) => updateParam("language", e.target.value)}
        className="rounded-pill min-h-11 font-bold text-sm"
      >
        <option value="">Language: All</option>
        {languages.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Sort by name"
        value={searchParams.get("sort") ?? ""}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="rounded-pill min-h-11 font-bold text-sm"
      >
        <option value="">Sort: none</option>
        <option value="asc">Name A–Z</option>
        <option value="desc">Name Z–A</option>
      </Select>
    </div>
  );
}
