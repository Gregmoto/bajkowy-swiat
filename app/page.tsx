import Nawigacja from "@/components/shared/Nawigacja";
import StopkaStrony from "@/components/shared/StopkaStrony";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

// Strona główna (landing) — serwowana przez root layout (bez route group konfliktu)
export default function StronaGlowna() {
  return (
    <>
      <Nawigacja wariant="publiczna" />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <StopkaStrony />
    </>
  );
}
