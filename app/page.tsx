import CTA from "@/components/landing-page/CTA";
import FAQ from "@/components/landing-page/FAQ";
import FeaturesAccordion from "@/components/landing-page/FeaturesAccordion";
import FeaturesGrid from "@/components/landing-page/FeaturesGrid";
import FeaturesListicle from "@/components/landing-page/FeaturesListicle";
import Footer from "@/components/Footer";
import Header from "@/components/landing-page/Header";
import Hero from "@/components/landing-page/Hero";
import Pricing from "@/components/landing-page/Pricing";
import Problem from "@/components/landing-page/Problem";
import { Suspense } from 'react'
import Testimonials3 from "@/components/landing-page/Testimonials3";
import WithWithout from "@/components/landing-page/WithWithout";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <FeaturesGrid />
        <WithWithout />
        <FeaturesListicle />
        <Problem />
        <FeaturesAccordion />
        <Pricing />
        <Testimonials3 />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}