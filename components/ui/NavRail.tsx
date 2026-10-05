"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CollectionIcon, SearchIcon, TradeIcon, WantListIcon } from "./icons";

const TABS = [
  { href: "/dashboard", label: "Collection", Icon: CollectionIcon },
  { href: "/wantlist", label: "Want List", Icon: WantListIcon },
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/trade", label: "Trade", Icon: TradeIcon },
] as const;

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Main sections"
      className="flex md:flex-col items-center gap-2 bg-ink text-paper py-4 md:py-4 px-0 w-full md:w-[84px] shrink-0 justify-around md:justify-start order-2 md:order-1"
    >
      <div className="hidden md:block font-display text-2xl mb-4" aria-hidden="true">
        P
      </div>
      {TABS.map(({ href, label, Icon }) => {
        const selected = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            role="tab"
            aria-selected={selected}
            className={`flex flex-col items-center justify-center gap-1 w-14 md:w-15 min-h-12 md:min-h-15 rounded-card text-[0.6875rem] font-bold no-underline ${
              selected ? "bg-sky-700 text-paper opacity-100 shadow-[0_4px_0_0_rgba(36,31,61,0.15)]" : "text-paper opacity-75 hover:opacity-100"
            }`}
          >
            <Icon className="w-[22px] h-[22px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
