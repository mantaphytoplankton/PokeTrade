"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginUser, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

const initialState: ActionState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginUser, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-lg font-display text-center">Log in</h1>

      {state.error ? (
        <p role="alert" className="text-sm font-semibold text-coral-700 text-center">
          {state.error}
        </p>
      ) : null}

      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <TextInput id="email" name="email" type="email" autoComplete="email" placeholder="ash@example.com" required />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
        <TextInput id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </Field>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-[0.8125rem] text-ink-soft text-center">
        <Link href="/reset-password" className="text-sky-700 font-semibold">
          Forgot your password?
        </Link>
      </p>
      <p className="text-[0.8125rem] text-ink-soft text-center">
        New here?{" "}
        <Link href="/register" className="text-sky-700 font-semibold">
          Create an account
        </Link>
      </p>
    </form>
  );
}
