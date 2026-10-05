import type { Signal } from "@/lib/schemas";
import { AlertIcon, CheckIcon, StopIcon } from "./icons";

// Every price/fairness signal is icon + label + description + color —
// never color alone (BRD Price Status Classification, DQ-01, PRICE-03).
const SIGNAL_STYLES: Record<Signal, { bg: string; fg: string; Icon: typeof CheckIcon }> = {
  green: { bg: "bg-leaf-100", fg: "text-leaf-700", Icon: CheckIcon },
  yellow: { bg: "bg-spark-100", fg: "text-spark-700", Icon: AlertIcon },
  red: { bg: "bg-coral-100", fg: "text-coral-700", Icon: StopIcon },
};

export function Chip({
  signal,
  label,
  description,
}: {
  signal: Signal;
  label: string;
  description: string;
}) {
  const { bg, fg, Icon } = SIGNAL_STYLES[signal];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-extrabold w-fit ${bg} ${fg}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>
        {label}
        <span className="block text-[0.6875rem] font-semibold opacity-85 mt-0.5">{description}</span>
      </span>
    </span>
  );
}
