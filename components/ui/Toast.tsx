"use client";

import { useEffect, useState } from "react";

// Server Actions redirect with `?flash=<message>` after a mutation (add,
// remove, ...). This picks it up once, shows it, and strips the query
// param from the visible URL without a navigation/re-fetch.
export function FlashToast({ initialMessage }: { initialMessage: string | undefined }) {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (!initialMessage) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("flash");
    window.history.replaceState({}, "", url.toString());
    const timer = setTimeout(() => setMessage(undefined), 2600);
    return () => clearTimeout(timer);
  }, [initialMessage]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-paper px-6 py-3 rounded-pill font-bold shadow-[0_4px_0_0_rgba(36,31,61,0.15)] z-[700]"
    >
      {message}
    </div>
  );
}
