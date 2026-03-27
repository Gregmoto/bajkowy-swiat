import Nawigacja from "@/components/shared/Nawigacja";
import StopkaStrony from "@/components/shared/StopkaStrony";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Themes from "@/components/landing/Themes";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";

export default function StronaGlowna() {
  return (
    <>
      <Nawigacja wariant="publiczna" />
      <main>
        {/* 1. Hero */}
        <Hero />
        {/* 2. Jak to działa */}
        <HowItWorks />
        {/* 3. Motywy bajek */}
        <Themes />
        {/* 4. Dlaczego rodzice to lubią */}
        <Features />
        {/* 5. Opinie użytkowników */}
        <Testimonials />
        {/* 6. FAQ */}
        <FAQ />
        {/* 7. CTA końcowe */}
        <CTA />
      </main>
      <StopkaStrony />
    </>
  );
}
