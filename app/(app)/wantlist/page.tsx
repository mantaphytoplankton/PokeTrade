import { WantListIcon } from "@/components/ui/icons";

export default function WantListPage() {
  return (
    <div className="max-w-[420px] mx-auto mt-12 text-center flex flex-col items-center gap-3">
      <WantListIcon className="w-14 h-14 text-ink-soft" />
      <h1 className="font-display text-lg">Want List is coming in MVP-3</h1>
      <p className="text-ink-soft text-sm">
        This release covers MVP-1 (build &amp; browse your collection). Tracking wanted cards ships next — see stories.md, WANT-01/02/03.
      </p>
    </div>
  );
}
