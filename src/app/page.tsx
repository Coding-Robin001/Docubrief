import HeroSection from "@/components/landingPage/heroSection";
import HowItWorksSection from "@/components/landingPage/howItWorksSection";
import PricingSection from "@/components/landingPage/pricingSection";
import CtaSection from "@/components/landingPage/ctaSection";
import QuickOverviewSection from "@/components/landingPage/quickOverview";

export default function Home() {
  return (
    <div className="bg-red">
      <main>
        <HeroSection />
        <QuickOverviewSection />
        <HowItWorksSection />
        <PricingSection />
        <CtaSection />
      </main>
    </div>
  );
}
