import Link from "next/link";

import { ElectionsDirectory } from "@/components/elections/elections-directory";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import {
  extractCategories,
  getPublicElections,
} from "@/lib/elections/data";

export const metadata = {
  title: "Elections | VoteFlow",
  description: "Browse published, live, and completed elections on VoteFlow.",
};

export default async function ElectionsPage() {
  const elections = await getPublicElections();
  const categories = extractCategories(elections);

  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-paper pt-16">
        <div className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(93,232,208,0.2),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(232,201,110,0.16),transparent_32%)]" />
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="status-pill border-teal/20 bg-teal/10 text-teal">
              Elections
            </p>
            <h1 className="display-heading mt-5 text-4xl lg:text-6xl">
              Find your next election
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Discover upcoming, live, and completed elections. Register to vote
              when spots are available.
            </p>
            <Link
              href="/auth/signup"
              className="btn-primary mt-8 px-6 py-3"
            >
              Create an account
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <ElectionsDirectory elections={elections} categories={categories} />
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
