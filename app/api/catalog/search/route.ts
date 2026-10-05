import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { searchCards } from "@/lib/catalog/search";

// A plain GET Route Handler (not a Server Action) — this is a read, and it
// pairs naturally with React Query's queryFn-fetches-a-URL pattern on the
// client (see specs/app/app-design.md §5).
export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ ok: false, reason: "invalid_input", message: "Not authenticated." }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const result = await searchCards(query);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
