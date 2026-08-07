import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { WhyCodeCompass } from "@/components/sections/why-codecompass";
import { CareerPaths } from "@/components/sections/career-paths";
import { JourneyTimeline } from "@/components/sections/journey-timeline";
import { AiTools } from "@/components/sections/ai-tools";
import { DashboardPreview } from "@/components/sections/dashboard-preview";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative">
        <Hero />
        <Stats />
        <WhyCodeCompass />
        <CareerPaths />
        <JourneyTimeline />
        <AiTools />
        <DashboardPreview />
        <FeaturesGrid />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
