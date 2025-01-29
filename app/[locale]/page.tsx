"use client";

import CTA from "@/components/landing-page/CTA";
import { CompaniesCarousel } from "@/components/landing-page/companies-carousel";
import FAQ from "@/components/landing-page/FAQ";
import FeaturesAccordion from "@/components/landing-page/FeaturesAccordion";
import FeaturesListicle from "@/components/landing-page/FeaturesListicle";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/landing-page/Hero";
import Pricing from "@/components/landing-page/Pricing";
import Problem from "@/components/landing-page/Problem";
import { Solution } from "@/components/landing-page/solution";
import { Suspense } from 'react'
import Testimonials3 from "@/components/landing-page/Testimonials3";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex flex-col justify-center items-center gap-12 mx-auto mt-24">
        <Hero />
        {/* Company logos */}
        <CompaniesCarousel />
        {/* Problem*/}
        <Problem />
        {/* Solution*/}
        <Solution />
        {/* How it works*/}
        <FeaturesAccordion />
        {/* Testimonials*/}
        <Testimonials3 />
        {/* Features*/}
        <FeaturesListicle />
        {/* Pricing*/}
        <Pricing />
        {/* FAQ*/}
        <FAQ />
        {/* CTA*/}
        <CTA />
      </main>
      <Footer />
    </>
  );
}
