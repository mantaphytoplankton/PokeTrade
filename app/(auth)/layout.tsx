export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
      <div className="w-full max-w-[400px] bg-paper-raised border-[2.5px] border-ink rounded-card shadow-[0_4px_0_0_rgba(36,31,61,0.15)] p-8 flex flex-col gap-6">
        <div className="flex items-center justify-center gap-2 font-display text-2xl text-ember-700" aria-hidden="false">
          Poke<span className="text-sky-700">Trade</span>
        </div>
        {children}
      </div>
    </div>
  );
}
