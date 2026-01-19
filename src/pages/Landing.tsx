import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { ClarificationSection } from "@/components/sections/ClarificationSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { BenefitsListSection } from "@/components/sections/BenefitsListSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { getLandingVariant } from "@/content/lpVariants";
const Landing = () => {
  const copy = getLandingVariant("lp07");

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main className="pb-20 md:pb-0">
        <HeroSection copy={copy.hero} />
        <ClarificationSection copy={copy.clarification} />
        <ProblemSection copy={copy.problem} />
        <SolutionSection copy={copy.solution} />
        <BenefitsSection />
        <TestimonialsSection copy={copy.testimonials} />
        <ProcessSection copy={copy.process} />
        <BenefitsListSection copy={copy.benefitsList} />
        <FAQSection copy={copy.faq} />
        <FinalCTASection copy={copy.finalCta} />
      </main>
    </div>
  );
};

export default Landing;
