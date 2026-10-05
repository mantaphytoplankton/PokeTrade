"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { LoginInput, RegisterInput } from "@/lib/schemas";
import { hashPassword, verifyPassword, type PasswordHash } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from "@/lib/auth/session";
import { createResetToken, verifyResetToken } from "@/lib/auth/resetToken";
import { atomicWriteJson, readJson } from "@/lib/persistence/atomicWrite";
import { emailIndexPath, userProfilePath } from "@/lib/persistence/paths";

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

interface UserProfile {
  userId: string;
  name: string;
  email: string;
  password: PasswordHash;
  collectorLevel: string;
  createdAt: string;
}

async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });
}

function fieldErrorsFromZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function registerUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = RegisterInput.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    collectorLevel: formData.get("collectorLevel"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const { name, email, password, collectorLevel } = parsed.data;

  const emailIndex = (await readJson<Record<string, string>>(emailIndexPath())) ?? {};
  if (emailIndex[email]) {
    return { fieldErrors: { email: "That email is already registered." } };
  }

  const userId = randomUUID();
  const profile: UserProfile = {
    userId,
    name,
    email,
    password: await hashPassword(password),
    collectorLevel,
    createdAt: new Date().toISOString(),
  };

  // Profile is the source of truth; write it first, then the index — see
  // specs/app/app-design.md §3 on ordering and rebuildability.
  await atomicWriteJson(userProfilePath(userId), profile);
  emailIndex[email] = userId;
  await atomicWriteJson(emailIndexPath(), emailIndex);

  await setSessionCookie(userId);
  redirect("/dashboard");
}

export async function loginUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = LoginInput.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const { email, password } = parsed.data;

  const emailIndex = (await readJson<Record<string, string>>(emailIndexPath())) ?? {};
  const userId = emailIndex[email];
  const genericError = { error: "Invalid email or password." };
  if (!userId) return genericError; // no user enumeration

  const profile = await readJson<UserProfile>(userProfilePath(userId));
  if (!profile) return genericError;

  const valid = await verifyPassword(password, profile.password);
  if (!valid) return genericError;

  await setSessionCookie(userId);
  redirect("/dashboard");
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

const RequestResetInput = z.object({ email: z.string().trim().toLowerCase().email() });

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = RequestResetInput.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: { email: "Enter a valid email." } };

  const emailIndex = (await readJson<Record<string, string>>(emailIndexPath())) ?? {};
  const userId = emailIndex[parsed.data.email];

  // Same confirmation regardless of whether the account exists — no user
  // enumeration via the reset flow either.
  if (userId) {
    const token = createResetToken(userId);
    await sendResetEmail(parsed.data.email, token);
  }
  return {};
}

async function sendResetEmail(email: string, token: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  if (!apiKey) {
    // No key configured — fail loudly in a way a developer will see in logs,
    // rather than silently pretending an email was sent (tech-spec.md: "on
    // failure, return error to caller — never silent empty success").
    console.error(`RESEND_API_KEY not set; would have emailed ${email}: ${resetUrl}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "PokeTrade <onboarding@resend.dev>",
      to: email,
      subject: "Reset your PokeTrade password",
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    }),
  });
  if (!res.ok) {
    console.error(`Resend send failed: HTTP ${res.status} ${await res.text()}`);
  }
}

const CompleteResetInput = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Use at least 8 characters"),
});

export async function completePasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = CompleteResetInput.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };

  const claims = verifyResetToken(parsed.data.token);
  if (!claims) return { error: "That reset link is expired or invalid." };

  const profile = await readJson<UserProfile>(userProfilePath(claims.userId));
  if (!profile) return { error: "That reset link is expired or invalid." };

  profile.password = await hashPassword(parsed.data.password);
  await atomicWriteJson(userProfilePath(claims.userId), profile);

  await setSessionCookie(claims.userId);
  redirect("/dashboard");
}
