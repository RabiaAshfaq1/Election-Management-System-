import { Suspense } from "react";

import { LoginForm } from "@/app/auth/login/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
