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
        <div className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal">
              Elections
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-ink lg:text-5xl">
              Find your next election
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Discover upcoming, live, and completed elections. Register to vote
              when spots are available.
            </p>
            <Link
              href="/auth/signup"
              className="mt-8 inline-block rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-paper transition hover:bg-teal-light"
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
