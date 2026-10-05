// Simple thick-stroke line icons matching the "cartoon ink" language —
// see specs/ui-guideline.md §3.4. Not emoji: a status chip needs a
// consistent-weight icon at small sizes, which emoji can't guarantee.

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={3} className={className} aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={3} className={className} aria-hidden="true">
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

export function StopIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={3} className={className} aria-hidden="true">
      <path d="M9 3h6l6 6v6l-6 6H9l-6-6V9z" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function BackIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function CollectionIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 3v18M4 9h4M4 15h4" />
    </svg>
  );
}

export function WantListIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 21s-7-4.35-9.5-8.5C.7 9 2 5 6 5c2 0 3.5 1.2 4 2 0.5-0.8 2-2 4-2 4 0 5.3 4 3.5 7.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function TradeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M7 10l-4 4 4 4M3 14h13M17 4l4 4-4 4M21 8H8" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 7h3l2-3h6l2 3h3v13H4z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
