"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { RegistrationModal } from "@/components/elections/registration-modal";
import type { ElectionDetail, VoterRegistrationRow } from "@/lib/elections/data";
import {
  canRegisterForElection,
  isElectionFull,
  isRegistrationDeadlineOpen,
} from "@/lib/elections/status";

interface ElectionActionPanelProps {
  election: ElectionDetail;
  isLoggedIn: boolean;
  registration: VoterRegistrationRow | null;
  onWaitlist: boolean;
}

export function ElectionActionPanel({
  election,
  isLoggedIn,
  registration,
  onWaitlist: initialOnWaitlist,
}: ElectionActionPanelProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [onWaitlist, setOnWaitlist] = useState(initialOnWaitlist);
  const [voterCount, setVoterCount] = useState(election.voter_count);

  const progress = Math.min(
    100,
    Math.round((voterCount / election.max_voters) * 100)
  );
  const spotsLeft = Math.max(0, election.max_voters - voterCount);
  const full = isElectionFull({ ...election, voter_count: voterCount });
  const registrationOpen = canRegisterForElection({
    ...election,
    voter_count: voterCount,
  });
  const deadlineOpen = isRegistrationDeadlineOpen(election);

  const loginHref = `/auth/login?redirectTo=${encodeURIComponent(`/elections/${election.id}`)}`;

  async function handleRegister() {
    setLoading(true);
    try {
      const res = await fetch(`/api/elections/${election.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptTerms: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }

      toast.success("You are registered for this election!");
      setModalOpen(false);
      if (typeof data.voter_count === "number") {
        setVoterCount(data.voter_count);
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleWaitlist() {
    setWaitlistLoading(true);
    try {
      const res = await fetch(`/api/elections/${election.id}/waitlist`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not join waitlist");
        return;
      }

      toast.success("You have been added to the waitlist.");
      setOnWaitlist(true);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  }

  function renderContent() {
    if (!isLoggedIn) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Sign in with your VoteFlow account to register as a voter.
          </p>
          <Link
            href={loginHref}
            className="btn-primary w-full py-3.5"
          >
            Sign in to participate
          </Link>
        </div>
      );
    }

    if (election.status === "completed") {
      return (
        <Link
          href={`/elections/${election.id}/results`}
          className="btn-primary w-full py-3.5"
        >
          View Results
        </Link>
      );
    }

    if (registration) {
      if (election.status === "active" && !registration.has_voted) {
        return (
          <Link
            href={`/elections/${election.id}/vote`}
            className="btn-primary w-full py-3.5"
          >
            Cast Your Vote
          </Link>
        );
      }

      if (election.status === "active" && registration.has_voted) {
        return (
          <div className="rounded-xl border border-teal/20 bg-teal/5 p-4 text-center shadow-soft">
            <CheckCircle2 className="mx-auto h-8 w-8 text-teal" />
            <p className="mt-2 text-sm font-medium text-ink">
              You have already cast your vote.
            </p>
            <Link
              href={`/elections/${election.id}/results`}
              className="mt-4 inline-block text-sm font-semibold text-teal hover:underline"
            >
              View Results
            </Link>
          </div>
        );
      }

      return (
        <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 shadow-soft">
          <p className="text-sm font-medium text-ink">
            You&apos;re registered!
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Your secret voter ID will be emailed when the election starts.
          </p>
        </div>
      );
    }

    if (full || !deadlineOpen) {
      if (onWaitlist) {
        return (
          <div className="rounded-xl border border-border bg-white/60 p-4 text-center shadow-soft">
            <p className="text-sm font-medium text-ink">
              You&apos;re on the waitlist
            </p>
            <p className="mt-2 text-sm text-muted">
              We&apos;ll notify you if a spot opens up.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {deadlineOpen
              ? "Registration Closed — Waitlist Available"
              : "Registration deadline has passed."}
          </p>
          {deadlineOpen && (
            <button
              type="button"
              onClick={handleWaitlist}
              disabled={waitlistLoading}
              className="btn-ghost w-full gap-2 border-teal/40 py-3.5 text-teal disabled:opacity-50"
            >
              {waitlistLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Join Waitlist
            </button>
          )}
        </div>
      );
    }

    if (registrationOpen) {
      return (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted">Spots taken</span>
              <span className="font-medium text-ink">
                {voterCount.toLocaleString()} of{" "}
                {election.max_voters.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-paper2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal to-teal-light transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {spotsLeft.toLocaleString()} spot{spotsLeft === 1 ? "" : "s"}{" "}
              remaining
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary w-full py-4 text-base"
          >
            I Want to Participate
          </button>
        </div>
      );
    }

    return (
      <p className="text-sm text-muted">
        Registration is not available for this election right now.
      </p>
    );
  }

  return (
    <>
      <aside className="glass-card sticky top-24 rounded-[1.5rem] p-6">
        <h2 className="font-heading text-xl font-black text-ink">Participate</h2>
        <div className="mt-4 flex -space-x-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-teal/20 to-gold/30 text-[10px] font-bold text-teal"
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="mt-6">{renderContent()}</div>
      </aside>

      <RegistrationModal
        open={modalOpen}
        electionTitle={election.title}
        loading={loading}
        onClose={() => setModalOpen(false)}
        onConfirm={handleRegister}
      />
    </>
  );
}
