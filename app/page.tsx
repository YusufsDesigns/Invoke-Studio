import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedTools } from "@/components/landing/featured-tools";
import { ForCreators } from "@/components/landing/for-creators";
import { AgentReady } from "@/components/landing/agent-ready";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <FeaturedTools />
      <ForCreators />
      <AgentReady />
      <CtaBanner />
      <Footer />
    </main>
  );
}
