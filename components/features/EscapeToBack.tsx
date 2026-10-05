"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// CARD-05: Card Details closes via Close button, Escape, or outside click.
// This page is a real, deep-linkable route rather than only a modal (see
// specs/app/app-design.md §12's open question) — Escape here is the "close"
// affordance's equivalent for a full page: back to the collection.
export function EscapeToBack({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.push(href);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [href, router]);
  return null;
}
