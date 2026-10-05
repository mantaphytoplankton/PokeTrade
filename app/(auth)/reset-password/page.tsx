"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { completePasswordReset, requestPasswordReset, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

const initialState: ActionState = {};

function RequestResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  // A new object reference from the action (vs. the literal initialState)
  // means it has been submitted at least once, successfully (errors return
  // their own fieldErrors/error keys instead).
  const submittedSuccessfully = state !== initialState && !state.error && !state.fieldErrors;

  if (submittedSuccessfully) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-lg font-display">Check your email</h1>
        <p className="text-sm text-ink-soft">
          If an account exists for that email, we&apos;ve sent a link to reset your password. It expires in 1 hour.
        </p>
        <Link href="/login" className="text-sky-700 font-semibold text-sm">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-lg font-display text-center">Reset your password</h1>
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email} hint="We'll send you a link to reset your password.">
        <TextInput id="email" name="email" type="email" autoComplete="email" placeholder="ash@example.com" required />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-[0.8125rem] text-ink-soft text-center">
        <Link href="/login" className="text-sky-700 font-semibold">
          Back to log in
        </Link>
      </p>
    </form>
  );
}

function CompleteResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(completePasswordReset, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-lg font-display text-center">Choose a new password</h1>
      {state.error ? (
        <p role="alert" className="text-sm font-semibold text-coral-700 text-center">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <Field label="New password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 8 characters">
        <TextInput id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  return token ? <CompleteResetForm token={token} /> : <RequestResetForm />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
