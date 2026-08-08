import { SiteNav } from "@/components/navigation/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CareerPaths } from "@/components/sections/career-paths";
import { JourneyPreview } from "@/components/sections/journey-preview";
import { WhatYouLearn } from "@/components/sections/what-you-learn";
import { AiTools } from "@/components/sections/ai-tools";
import { DashboardPreview } from "@/components/sections/dashboard-preview";
import { About } from "@/components/sections/about";
import { FinalCta } from "@/components/sections/final-cta";

/**
 * Phase 1 landing page. Each section is a self-contained component so later
 * phases can replace one in place — e.g. CareerPaths becomes data-driven and
 * links to /careers/[slug] — without touching this file.
 */
export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <Hero />
        <Problem />
        <HowItWorks />
        <CareerPaths />
        <JourneyPreview />
        <WhatYouLearn />
        <AiTools />
        <DashboardPreview />
        <About />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
