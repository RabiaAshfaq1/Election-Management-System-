"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { redirectToDashboard } from "@/lib/auth-client";
import { createClient } from "@/lib/supabase";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingSession, setCheckingSession] = useState(true);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_callback") {
      toast.error("Authentication link expired or invalid. Please try again.");
    }
    if (error === "missing_role") {
      toast.error("Your account is missing a role. Contact an administrator.");
    }

    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const path = await redirectToDashboard(supabase);
        if (path) router.replace(path);
      }
      setCheckingSession(false);
    });
  }, [router, searchParams]);

  const onSubmit = async (data: LoginInput) => {
    const turnstileToken = turnstileRef.current?.getToken();
    if (
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      !turnstileToken
    ) {
      toast.error("Please complete the CAPTCHA verification.");
      return;
    }

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      const captchaRes = await fetch("/api/auth/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstileToken: turnstileToken ?? "dev-bypass",
        }),
      });
      if (!captchaRes.ok) {
        turnstileRef.current?.reset();
        const captchaPayload = await captchaRes.json().catch(() => ({}));
        toast.error(
          typeof captchaPayload.error === "string"
            ? captchaPayload.error
            : "CAPTCHA verification failed"
        );
        return;
      }
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      turnstileRef.current?.reset();
      const message = signInError.message.toLowerCase().includes("email not confirmed")
        ? "Please verify your email first. Check your inbox for the confirmation link."
        : signInError.message;
      toast.error(message);
      return;
    }

    const redirectTo = searchParams.get("redirectTo");
    const dashboardPath = await redirectToDashboard(supabase);

    if (!dashboardPath) {
      toast.error(
        "Signed in, but your profile could not be loaded. Run the super_admin SQL in Supabase or contact support."
      );
      await supabase.auth.signOut();
      turnstileRef.current?.reset();
      return;
    }

    toast.success("Welcome back!");
    router.push(redirectTo ?? dashboardPath);
    router.refresh();
  };

  if (checkingSession) {
    return (
      <AuthShell>
        <AnimatedCard className="flex min-h-[320px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        </AnimatedCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AnimatedCard>
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to access your VoteFlow dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            registration={register("email")}
            error={errors.email}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            registration={register("password")}
            error={errors.password}
          />

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-teal hover:text-teal-light"
            >
              Forgot password?
            </Link>
          </div>

          <TurnstileWidget ref={turnstileRef} className="flex justify-center" />

          <div className="pt-2">
            <SubmitButton loading={isSubmitting}>Sign in</SubmitButton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-teal hover:text-teal-light"
          >
            Sign up
          </Link>
        </p>
      </AnimatedCard>
    </AuthShell>
  );
}
