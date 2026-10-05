"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CardIdentity, ToolResult } from "@/lib/schemas";
import { CardThumb } from "@/components/ui/CardThumb";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { AddToCollectionModal } from "./AddToCollectionModal";

async function fetchSearch(query: string): Promise<ToolResult<CardIdentity[]>> {
  const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

async function fetchCard(cardId: string): Promise<ToolResult<{ identity: CardIdentity }>> {
  const res = await fetch(`/api/catalog/card/${encodeURIComponent(cardId)}`);
  return res.json();
}

export function SearchPanel() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardIdentity | null>(null);
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["catalog-search", submittedQuery],
    queryFn: () => fetchSearch(submittedQuery as string),
    enabled: submittedQuery !== null && submittedQuery.length > 0,
  });

  async function handlePick(cardId: string) {
    setAddError(null);
    setLoadingCardId(cardId);
    const result = await fetchCard(cardId);
    setLoadingCardId(null);
    if (!result.ok) {
      setAddError("We couldn't load that card's details. Try again.");
      return;
    }
    setSelectedCard(result.data.identity);
  }

  const results = data?.ok ? data.data : [];

  return (
    <div>
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="flex gap-2 items-start">
          <span className="font-display bg-sky-700 text-paper w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
          <p className="text-[0.8125rem] text-ink-soft max-w-[220px]">
            <strong className="block text-[0.9375rem] text-ink">Search</strong>
            Type a card name.
          </p>
        </div>
        <div className="flex gap-2 items-start">
          <span className="font-display bg-sky-700 text-paper w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
          <p className="text-[0.8125rem] text-ink-soft max-w-[220px]">
            <strong className="block text-[0.9375rem] text-ink">Pick the printing</strong>
            Match the set and card number.
          </p>
        </div>
        <div className="flex gap-2 items-start">
          <span className="font-display bg-sky-700 text-paper w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0">3</span>
          <p className="text-[0.8125rem] text-ink-soft max-w-[220px]">
            <strong className="block text-[0.9375rem] text-ink">Add it</strong>
            Set condition and quantity.
          </p>
        </div>
      </div>

      <form
        className="flex gap-2 mb-6 max-w-[480px]"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmittedQuery(inputValue.trim());
        }}
      >
        <label htmlFor="search-input" className="sr-only">
          Search the catalog
        </label>
        <TextInput
          id="search-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Try “Charizard” or “Pikachu”"
          className="flex-1 rounded-pill"
        />
        <Button type="submit" disabled={isFetching || inputValue.trim().length === 0}>
          {isFetching ? "Searching…" : "Search"}
        </Button>
      </form>

      {addError ? <p className="text-sm font-semibold text-coral-700 mb-4">{addError}</p> : null}

      {submittedQuery && !isFetching && results.length === 0 ? (
        <div className="border-2 border-dashed border-ink-soft rounded-card p-8 text-center text-ink-soft max-w-[480px]">
          We couldn&apos;t find that card. Try the exact name or a set code.
        </div>
      ) : null}

      {results.length > 0 ? (
        <ul className="flex flex-col gap-3 max-w-[640px] list-none p-0 m-0" aria-live="polite">
          {results.map((card) => (
            <li
              key={card.cardId}
              className="flex items-center gap-4 border-[2.5px] border-ink rounded-card bg-paper-raised p-3 shadow-[0_4px_0_0_rgba(36,31,61,0.15)]"
            >
              <CardThumb name={card.name} catalogImageUrl={card.images?.small} size={56} />
              <div className="flex-1 min-w-0">
                <strong>{card.name}</strong>
                <div className="text-[0.8125rem] text-ink-soft">
                  {card.setCode} · {card.number}
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handlePick(card.cardId)}
                disabled={loadingCardId === card.cardId}
              >
                {loadingCardId === card.cardId ? "Loading…" : "Add"}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <AddToCollectionModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
