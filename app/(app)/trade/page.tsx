import { TradeIcon } from "@/components/ui/icons";

export default function TradePage() {
  return (
    <div className="max-w-[420px] mx-auto mt-12 text-center flex flex-col items-center gap-3">
      <TradeIcon className="w-14 h-14 text-ink-soft" />
      <h1 className="font-display text-lg">Trade Analysis is coming in MVP-2</h1>
      <p className="text-ink-soft text-sm">
        The fairness-checking agent ships once this collection flow is in place — see stories.md, SCRATCH/AGENT/TRADE features.
      </p>
    </div>
  );
}
