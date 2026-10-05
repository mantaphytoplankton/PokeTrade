import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getCard } from "@/lib/catalog/card";

export async function GET(_request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "invalid_input", message: "Not authenticated." }, { status: 401 });
  }

  const { cardId } = await params;
  const result = await getCard(cardId);
  return NextResponse.json(result, { status: result.ok ? 200 : result.reason === "not_found" ? 404 : 502 });
}
