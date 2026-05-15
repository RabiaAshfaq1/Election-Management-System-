import { Suspense } from "react";

import { CtaSection } from "@/components/landing/cta-section";
import { ElectionsBlock } from "@/components/landing/elections-block";
import { ElectionsSkeleton } from "@/components/landing/elections-skeleton";
import { Features } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNavbar } from "@/components/landing/navbar";
import { Marquee } from "@/components/landing/marquee";
import { ResultsPreview } from "@/components/landing/results-preview";
import { getPlatformStats } from "@/lib/landing/data";

export default async function HomePage() {
  const stats = await getPlatformStats();

  return (
    <main className="min-h-screen bg-paper">
      <LandingNavbar />
      <Hero stats={stats} />
      <Marquee />
      <Suspense
        fallback={
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="mb-12 h-12 w-64 animate-pulse rounded-lg bg-white" />
              <ElectionsSkeleton />
            </div>
          </section>
        }
      >
        <ElectionsBlock />
      </Suspense>
      <Features />
      <ResultsPreview />
      <HowItWorks />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
