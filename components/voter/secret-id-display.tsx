"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { maskSecretId } from "@/lib/secret-id";

interface SecretIdDisplayProps {
  secretId: string;
}

export function SecretIdDisplay({ secretId }: SecretIdDisplayProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <code className="rounded-lg bg-paper px-2.5 py-1 font-mono text-xs text-ink">
        {revealed ? secretId : maskSecretId(secretId)}
      </code>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-teal"
        aria-label={revealed ? "Hide secret ID" : "Reveal secret ID"}
        title={revealed ? "Hide" : "Reveal"}
      >
        {revealed ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
