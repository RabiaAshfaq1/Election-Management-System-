"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AnimatedCard } from "@/components/auth/animated-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { createClient } from "@/lib/supabase";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Reset link is invalid or expired.");
        router.replace("/auth/forgot-password");
        return;
      }
      setReady(true);
    });
  }, [router]);

  const onSubmit = async (data: ResetPasswordInput) => {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    await supabase.auth.signOut();
    toast.success("Password updated. Please sign in with your new password.");
    router.push("/auth/login");
  };

  if (!ready) {
    return (
      <AuthShell showPanel={false}>
        <AnimatedCard className="flex min-h-[280px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        </AnimatedCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell showPanel={false}>
      <AnimatedCard>
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-ink">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-muted">
            Choose a strong password for your VoteFlow account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="New password"
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
          <div className="pt-2">
            <SubmitButton loading={isSubmitting}>
              Update password
            </SubmitButton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href="/auth/login"
            className="font-semibold text-teal hover:text-teal-light"
          >
            Back to sign in
          </Link>
        </p>
      </AnimatedCard>
    </AuthShell>
  );
}
