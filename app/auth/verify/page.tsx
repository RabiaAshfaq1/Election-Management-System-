"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { AnimatedCard } from "@/components/auth/animated-card";
import { AuthLogo } from "@/components/auth/auth-logo";
import { SubmitButton } from "@/components/auth/submit-button";
import { createClient } from "@/lib/supabase";

function VerifyContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email on the sign up page first.");
      return;
    }

    setResending(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/verify")}`,
      },
    });

    setResending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verification email resent");
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="px-6 py-6 sm:px-10">
        <AuthLogo />
      </header>

      <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6 pb-12">
        <AnimatedCard className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
            <Mail className="h-8 w-8 text-teal" strokeWidth={1.75} />
          </div>

          <h1 className="font-heading text-2xl font-bold text-ink">
            Check your inbox
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            We sent a verification link to your email. Click the link to
            activate your VoteFlow account and start voting.
          </p>

          {email ? (
            <p className="mt-2 text-sm font-medium text-ink">{email}</p>
          ) : (
            <div className="mt-4">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>
          )}

          <div className="mt-6">
            <SubmitButton
              type="button"
              loading={resending}
              onClick={handleResend}
            >
              Resend verification email
            </SubmitButton>
          </div>

          <p className="mt-6 text-sm text-muted">
            Wrong email?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-teal hover:text-teal-light"
            >
              Sign up again
            </Link>
            {" · "}
            <Link
              href="/auth/login"
              className="font-semibold text-teal hover:text-teal-light"
            >
              Sign in
            </Link>
          </p>
        </AnimatedCard>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
