"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "font-body border border-white/80 bg-white/75 shadow-card backdrop-blur-2xl",
        },
      }}
    />
  );
}
