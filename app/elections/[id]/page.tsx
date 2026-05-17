import { notFound } from "next/navigation";

import { ElectionActionPanel } from "@/components/elections/election-action-panel";
import { ElectionCandidatesList } from "@/components/elections/election-candidates-list";
import { ElectionDetailHero } from "@/components/elections/election-detail-hero";
import { ElectionTimeline } from "@/components/elections/election-timeline";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { getOptionalAuth } from "@/lib/auth-server";
import {
  getElectionDetail,
  getUserRegistration,
  isUserOnWaitlist,
} from "@/lib/elections/data";

interface ElectionDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ElectionDetailPageProps) {
  const election = await getElectionDetail(params.id);
  if (!election) {
    return { title: "Election not found | VoteFlow" };
  }
  return {
    title: `${election.title} | VoteFlow`,
    description: election.description ?? undefined,
  };
}

export default async function ElectionDetailPage({
  params,
}: ElectionDetailPageProps) {
  const election = await getElectionDetail(params.id);

  if (!election) {
    notFound();
  }

  const session = await getOptionalAuth();
  const registration = session
    ? await getUserRegistration(params.id, session.user.id)
    : null;
  const onWaitlist = session
    ? await isUserOnWaitlist(params.id, session.user.id)
    : false;

  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-paper">
        <ElectionDetailHero election={election} />

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
            <div className="space-y-10">
              {election.description && (
                <section className="glass-card rounded-[1.5rem] p-6">
                  <h2 className="font-heading text-2xl font-black text-ink">
                    About
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted">
                    {election.description}
                  </p>
                </section>
              )}

              <ElectionTimeline election={election} />
              <ElectionCandidatesList candidates={election.candidates} />
            </div>

            <ElectionActionPanel
              election={election}
              isLoggedIn={Boolean(session)}
              registration={registration}
              onWaitlist={onWaitlist}
            />
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
