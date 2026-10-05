"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CardIdentity } from "@/lib/schemas";
import { addCardToCollection } from "@/actions/collection";
import { Modal } from "@/components/ui/Modal";
import { CardThumb } from "@/components/ui/CardThumb";
import { Field, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { UploadIcon } from "@/components/ui/icons";

const CONDITIONS = ["Near Mint", "Lightly Played", "Moderately Played", "Damaged"] as const;

export function AddToCollectionModal({
  card,
  onClose,
}: {
  card: CardIdentity | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number]>("Near Mint");
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!card) return;
    setPending(true);
    setError(null);
    const result = await addCardToCollection({
      cardId: card.cardId,
      name: card.name,
      setCode: card.setCode,
      setName: card.setName,
      number: card.number,
      language: card.language,
      rarity: card.rarity,
      imageUrl: card.images?.large,
      condition,
      quantity,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    router.push(`/dashboard?flash=${encodeURIComponent(`Added ${card.name} to your collection`)}`);
  }

  return (
    <Modal open={card !== null} onClose={onClose} title="Add to collection">
      {card ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <CardThumb name={card.name} catalogImageUrl={card.images?.large} size={100} />
            <div>
              <h3 className="text-base font-extrabold">{card.name}</h3>
              <p className="text-[0.8125rem] text-ink-soft">
                {card.setName || card.setCode} · {card.number}
                {card.rarity ? ` · ${card.rarity}` : ""}
              </p>
            </div>
          </div>

          {error ? <p className="text-sm font-semibold text-coral-700">{error}</p> : null}

          <Field label="Condition" htmlFor="condition">
            <Select id="condition" value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">Quantity</span>
            <div className="inline-flex items-center border-[2.5px] border-ink rounded-pill overflow-hidden w-fit">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 bg-neutral-100 font-extrabold text-lg"
              >
                −
              </button>
              <output className="inline-flex w-10 justify-center font-data font-semibold">{quantity}</output>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 bg-neutral-100 font-extrabold text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">Card photo (optional)</span>
            <Button type="button" variant="secondary" className="justify-start" disabled>
              <UploadIcon className="w-[18px] h-[18px]" />
              Upload a photo
            </Button>
            <p className="text-[0.8125rem] text-ink-soft">Coming soon — see stories.md SRCH-05.</p>
          </div>

          <Button type="button" onClick={handleConfirm} disabled={pending} className="w-full">
            {pending ? "Adding…" : "Add to collection"}
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}
