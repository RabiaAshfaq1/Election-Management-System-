"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AnimatedCard } from "@/components/auth/animated-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  TurnstileWidget,
  type TurnstileHandle,
} from "@/components/auth/turnstile-widget";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const turnstileRef = useRef<TurnstileHandle>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    const turnstileToken = turnstileRef.current?.getToken();
    if (
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      !turnstileToken
    ) {
      toast.error("Please complete the CAPTCHA verification.");
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        turnstileToken: turnstileToken ?? "dev-bypass",
      }),
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      turnstileRef.current?.reset();
      toast.error(
        typeof payload.error === "string"
          ? payload.error
          : "Could not create account"
      );
      return;
    }

    setEmail(data.email);
    setSubmitted(true);
    toast.success("Account created! Check your email to verify.");

    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `/auth/verify?email=${encodeURIComponent(data.email)}`
      );
    }
  };

  return (
    <AuthShell>
      <AnimatedCard>
        {submitted ? (
          <CheckEmailState email={email} />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-heading text-2xl font-bold text-ink">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-muted">
                Join VoteFlow to participate in secure online elections.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                label="Full name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                registration={register("fullName")}
                error={errors.fullName}
              />
              <FormField
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                registration={register("email")}
                error={errors.email}
              />
              <FormField
                label="Phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 234 567 8900"
                registration={register("phone")}
                error={errors.phone}
              />
              <FormField
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                registration={register("password")}
                error={errors.password}
              />
              <FormField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                registration={register("confirmPassword")}
                error={errors.confirmPassword}
              />

              <TurnstileWidget
                ref={turnstileRef}
                className="flex justify-center"
              />

              <div className="pt-2">
                <SubmitButton loading={isSubmitting}>
                  Create account
                </SubmitButton>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-teal hover:text-teal-light"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </AnimatedCard>
    </AuthShell>
  );
}

function CheckEmailState({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10">
        <svg
          className="h-7 w-7 text-teal"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h1 className="font-heading text-2xl font-bold text-ink">
        Check your email
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        We sent a confirmation link to{" "}
        <span className="font-medium text-ink">{email}</span>. Click it to
        activate your account.
      </p>
      <Link
        href="/auth/login"
        className="mt-6 inline-block text-sm font-semibold text-teal hover:text-teal-light"
      >
        Back to sign in
      </Link>
    </div>
  );
}
