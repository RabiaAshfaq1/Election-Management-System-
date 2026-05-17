"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CandidateAvatar } from "@/components/creator/candidate-avatar";
import type { Candidate } from "@/lib/types";
import { cn } from "@/lib/utils";

type VoteStep = "verify" | "ballot" | "success";

interface VoteExperienceProps {
  electionId: string;
  electionTitle: string;
  candidates: Candidate[];
}

export function VoteExperience({
  electionId,
  electionTitle,
  candidates,
}: VoteExperienceProps) {
  const router = useRouter();
  const [step, setStep] = useState<VoteStep>("verify");
  const [secretId, setSecretId] = useState("");
  const [verifiedSecretId, setVerifiedSecretId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifyError("");
    setVerifying(true);

    try {
      const res = await fetch(`/api/elections/${electionId}/verify-secret-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setShake(true);
        setVerifyError(
          data.error ?? "That ID does not match our records. Please try again."
        );
        setTimeout(() => setShake(false), 500);
        return;
      }

      setVerifiedSecretId(secretId.trim().toUpperCase());
      setStep("ballot");
    } catch {
      setShake(true);
      setVerifyError("Unable to verify. Please try again.");
      setTimeout(() => setShake(false), 500);
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmitVote() {
    if (!selectedId || !verifiedSecretId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/elections/${electionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secretId: verifiedSecretId,
          candidateId: selectedId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to cast vote");
        return;
      }

      setConfirmOpen(false);
      setStep("success");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 12%, rgba(93,232,208,0.28) 0%, transparent 40%), radial-gradient(circle at 80% 75%, rgba(232,201,110,0.22) 0%, transparent 42%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16">
        <AnimatePresence mode="wait">
          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg"
            >
              <motion.div
                animate={shake ? { x: [0, -12, 12, -10, 10, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-3xl p-10"
              >
                <p className="text-center font-heading text-3xl font-black text-ink">
                  Vote<span className="italic text-teal">Flow</span>
                </p>
                <p className="mt-2 text-center text-sm text-muted">
                  {electionTitle}
                </p>

                <h1 className="mt-10 text-center font-heading text-4xl font-black text-ink">
                  Verify Your Identity
                </h1>

                <form onSubmit={handleVerify} className="mt-8">
                  <label
                    htmlFor="secret-id"
                    className="sr-only"
                  >
                    Enter your Secret Voter ID
                  </label>
                  <input
                    id="secret-id"
                    type="text"
                    value={secretId}
                    onChange={(e) => setSecretId(e.target.value.toUpperCase())}
                    placeholder="POLL-XXXX-0000"
                    autoComplete="off"
                    spellCheck={false}
                    className={cn(
                      "w-full rounded-xl border-2 border-border bg-white/80 px-4 py-5 text-center font-mono text-2xl font-semibold uppercase tracking-[0.25em] text-ink outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/20",
                      shake && "shake border-accent"
                    )}
                  />
                  <p className="mt-4 text-center text-sm text-muted">
                    Your ID was emailed to you when the election was finalized
                  </p>

                  {verifyError && (
                    <p className="mt-4 text-center text-sm font-medium text-accent">
                      {verifyError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={verifying || !secretId.trim()}
                    className="btn-primary mt-8 w-full gap-2 py-4 text-base"
                  >
                    {verifying && <Loader2 className="h-5 w-5 animate-spin" />}
                    Verify
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {step === "ballot" && (
            <motion.div
              key="ballot"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-teal">
                  Official ballot
                </p>
                <h1 className="display-heading mt-3 text-4xl lg:text-5xl">
                  Cast Your Vote — Choose One Candidate
                </h1>
                <p className="mt-4 text-sm text-muted">
                  Your vote is anonymous. You cannot change it after submission.
                </p>
              </div>

              {candidates.length === 0 ? (
                <p className="glass-card rounded-2xl p-8 text-center text-muted">
                  No candidates are on the ballot yet. Please check back later.
                </p>
              ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {candidates.map((candidate) => {
                  const selected = selectedId === candidate.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelectedId(candidate.id)}
                      className={cn(
                        "premium-card relative overflow-hidden rounded-2xl border-2 p-6 text-left transition duration-300",
                        selected
                          ? "scale-[1.02] border-teal shadow-hover ring-4 ring-teal/10"
                          : "border-transparent hover:scale-[1.01] hover:border-teal/20"
                      )}
                    >
                      {selected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-teal text-white"
                        >
                          <Check className="h-5 w-5" strokeWidth={3} />
                        </motion.span>
                      )}
                      <CandidateAvatar
                        name={candidate.name}
                        photoUrl={candidate.photo_url}
                        size={64}
                      />
                      <h3 className="mt-4 font-heading text-xl font-black text-ink">
                        {candidate.name}
                      </h3>
                      {candidate.designation && (
                        <p className="mt-1 text-sm font-medium text-teal">
                          {candidate.designation}
                        </p>
                      )}
                      {candidate.manifesto && (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                          {candidate.manifesto}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
              )}

              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  disabled={!selectedId || candidates.length === 0}
                  onClick={() => setConfirmOpen(true)}
                  className="btn-primary px-12 py-4 text-base disabled:opacity-40"
                >
                  Submit Vote
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card flex w-full max-w-lg flex-col items-center rounded-3xl p-10 text-center"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                {[...Array(16)].map((_, index) => (
                  <span
                    key={index}
                    className="absolute h-2 w-2 rounded-full bg-teal/40"
                    style={{
                      left: `${10 + ((index * 17) % 80)}%`,
                      top: `${8 + ((index * 23) % 70)}%`,
                    }}
                  />
                ))}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 14,
                  delay: 0.1,
                }}
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-teal shadow-hover"
              >
                <Check className="h-12 w-12 text-white" strokeWidth={2.5} />
              </motion.div>
              <h1 className="mt-10 font-heading text-4xl font-black text-ink">
                Your vote has been cast
              </h1>
              <p className="mt-4 text-lg text-muted">
                Thank you for participating in {electionTitle}.
              </p>
              <Link
                href={`/elections/${electionId}/results`}
                className="btn-primary mt-10 px-10 py-4 text-base"
              >
                View Live Results
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {confirmOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => !submitting && setConfirmOpen(false)}
            aria-label="Close"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card relative w-full max-w-md rounded-2xl p-8"
          >
            <h2 className="font-heading text-2xl font-black text-ink">
              Confirm your vote
            </h2>
            <p className="mt-4 text-muted">
              You&apos;re about to vote for{" "}
              <strong className="text-ink">{selectedCandidate.name}</strong>.
              This cannot be undone.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
                className="btn-ghost flex-1 py-3 disabled:opacity-50"
              >
                Go back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitVote}
                className="btn-primary flex-1 gap-2 py-3 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm vote
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
