"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AnimatedCard } from "@/components/auth/animated-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { getAuthCallbackUrl } from "@/lib/auth-client";
import { createClient } from "@/lib/supabase";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: getAuthCallbackUrl("/auth/reset-password"),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setEmail(data.email);
    setSent(true);
    toast.success("Password reset email sent");
  };

  return (
    <AuthShell>
      <AnimatedCard>
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10">
              <Mail className="h-7 w-7 text-teal" strokeWidth={1.75} />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink">
              Check your inbox
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              If an account exists for{" "}
              <span className="font-medium text-ink">{email}</span>, we sent a
              password reset link.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block text-sm font-semibold text-teal hover:text-teal-light"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-heading text-2xl font-bold text-ink">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-muted">
                Enter your email and we&apos;ll send you a reset link.
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
              <div className="pt-2">
                <SubmitButton loading={isSubmitting}>
                  Send reset link
                </SubmitButton>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Remember your password?{" "}
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
