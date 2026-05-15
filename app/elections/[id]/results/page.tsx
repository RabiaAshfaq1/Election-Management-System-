import { notFound } from "next/navigation";

import { LiveResultsDashboard } from "@/components/results/live-results-dashboard";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { getElectionTransparencySummary } from "@/lib/audit/election-summary";
import { getElectionResults } from "@/lib/elections/results";

interface ResultsPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ResultsPageProps) {
  const data = await getElectionResults(params.id);
  if (!data) {
    return { title: "Results | VoteFlow" };
  }
  return {
    title: `Results — ${data.election.title} | VoteFlow`,
  };
}

export default async function ElectionResultsPage({ params }: ResultsPageProps) {
  const initialData = await getElectionResults(params.id);

  if (!initialData) {
    notFound();
  }

  const transparencySummary =
    initialData.election.status === "completed"
      ? await getElectionTransparencySummary(
          params.id,
          initialData.total_votes,
          true
        )
      : null;

  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-paper pt-16">
        <LiveResultsDashboard
          electionId={params.id}
          initialData={initialData}
          transparencySummary={transparencySummary}
        />
      </main>
      <LandingFooter />
    </>
  );
}
