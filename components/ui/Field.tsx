import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="font-bold text-sm">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-semibold text-coral-700">{error}</p>
      ) : hint ? (
        <p className="text-[0.8125rem] text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

const INPUT_CLASS =
  "font-body text-base border-[2.5px] border-ink rounded-card px-3 py-2 min-h-11 bg-paper-raised text-ink placeholder:text-ink-soft/70";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT_CLASS} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${INPUT_CLASS} ${props.className ?? ""}`} />;
}

export function FieldLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`font-bold text-sm ${props.className ?? ""}`} />;
}
