"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AddCardInput, type CollectionEntry } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { atomicWriteJson, readJson } from "@/lib/persistence/atomicWrite";
import { userCollectionPath } from "@/lib/persistence/paths";

export type AddCardResult = { ok: true } | { ok: false; error: string };

export async function addCardToCollection(input: unknown): Promise<AddCardResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "You need to log in again." };

  const parsed = AddCardInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That card entry isn't valid." };
  }
  const data = parsed.data;

  const collection = (await readJson<CollectionEntry[]>(userCollectionPath(userId))) ?? [];
  const existing = collection.find((c) => c.cardId === data.cardId && c.condition === data.condition);
  if (existing) {
    existing.quantity += data.quantity;
  } else {
    const entry: CollectionEntry = {
      entryId: randomUUID(),
      cardId: data.cardId,
      name: data.name,
      setCode: data.setCode,
      setName: data.setName,
      number: data.number,
      language: data.language,
      rarity: data.rarity,
      catalogImageUrl: data.imageUrl,
      condition: data.condition,
      quantity: data.quantity,
      addedAt: new Date().toISOString(),
    };
    collection.push(entry);
  }

  await atomicWriteJson(userCollectionPath(userId), collection);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removeCardFromCollection(entryId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const collection = (await readJson<CollectionEntry[]>(userCollectionPath(userId))) ?? [];
  const entry = collection.find((c) => c.entryId === entryId);
  const next = collection.filter((c) => c.entryId !== entryId);

  await atomicWriteJson(userCollectionPath(userId), next);
  revalidatePath("/dashboard");
  redirect(
    `/dashboard?flash=${encodeURIComponent(entry ? `Removed ${entry.name} from your collection` : "Removed from your collection")}`,
  );
}
