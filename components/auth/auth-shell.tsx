"use client";

import type { ReactNode } from "react";

import { AuthLogo } from "@/components/auth/auth-logo";
import { AuthPanel } from "@/components/auth/auth-panel";

interface AuthShellProps {
  children: ReactNode;
  showPanel?: boolean;
}

export function AuthShell({ children, showPanel = true }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="absolute left-0 right-0 top-0 z-10 px-6 py-6 sm:px-10">
        <AuthLogo />
      </header>

      <div className="flex min-h-screen items-center justify-center px-6 pb-12 pt-24 sm:px-10">
        <div
          className={
            showPanel
              ? "grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14"
              : "w-full max-w-md"
          }
        >
          <div className="w-full">{children}</div>
          {showPanel && <AuthPanel />}
        </div>
      </div>
    </div>
  );
}
