import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

const VARIANTS = {
  primary: "bg-ember-700 text-paper shadow-[0_4px_0_0_rgba(36,31,61,0.15)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(36,31,61,0.18)]",
  secondary: "bg-paper-raised text-ink shadow-[0_4px_0_0_rgba(36,31,61,0.15)] hover:-translate-y-0.5",
  danger: "bg-coral-100 text-coral-700 border-coral-700",
} as const;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-card border-[2.5px] border-ink font-extrabold text-base cursor-pointer min-h-11 px-6 py-2 transition-transform motion-reduce:transition-none";

type Variant = keyof typeof VARIANTS;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "secondary",
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return <a className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export function IconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center min-w-11 min-h-11 rounded-pill text-ink hover:bg-neutral-100 ${className}`}
      {...props}
    />
  );
}
