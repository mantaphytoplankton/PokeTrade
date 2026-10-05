"use client";

import { useState } from "react";
import { removeCardFromCollection } from "@/actions/collection";
import { Button } from "@/components/ui/Button";

export function RemoveCardButton({ entryId, cardName }: { entryId: string; cardName: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm(`Remove ${cardName} from your collection?`)) return;
    setPending(true);
    await removeCardFromCollection(entryId); // redirects on success
  }

  return (
    <Button type="button" variant="danger" onClick={handleClick} disabled={pending}>
      {pending ? "Removing…" : "Remove from collection"}
    </Button>
  );
}
