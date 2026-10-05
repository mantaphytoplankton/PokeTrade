"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerUser, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import type { CollectorLevel } from "@/lib/schemas";

const initialState: ActionState = {};

const LEVELS: { value: CollectorLevel; label: string }[] = [
  { value: "new", label: "New Trainer" },
  { value: "collector", label: "Collector" },
  { value: "pro", label: "Pro" },
];

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, initialState);
  const [level, setLevel] = useState<CollectorLevel>("new");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-lg font-display text-center">Create your account</h1>

      {state.error ? (
        <p role="alert" className="text-sm font-semibold text-coral-700 text-center">
          {state.error}
        </p>
      ) : null}

      <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
        <TextInput id="name" name="name" autoComplete="name" placeholder="Ash" required />
      </Field>
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <TextInput id="email" name="email" type="email" autoComplete="email" placeholder="ash@example.com" required />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 8 characters">
        <TextInput id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" minLength={8} required />
      </Field>

      <div className="flex flex-col gap-1">
        <span className="font-bold text-sm">How would you describe yourself?</span>
        <input type="hidden" name="collectorLevel" value={level} />
        <div role="group" aria-label="Collector experience" className="flex gap-2 flex-wrap">
          {LEVELS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={level === option.value}
              onClick={() => setLevel(option.value)}
              className={`border-[2.5px] rounded-pill px-4 py-2 min-h-11 font-bold ${
                level === option.value ? "bg-sky-100 border-sky-700 text-sky-700" : "bg-paper-raised border-ink text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating your account…" : "Create my account"}
      </Button>

      <p className="text-[0.8125rem] text-ink-soft text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-sky-700 font-semibold">
          Log in
        </Link>
      </p>
    </form>
  );
}
