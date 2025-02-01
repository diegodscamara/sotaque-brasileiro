"use client";

import CTA from "@/components/landing-page/CTA";
import { CompaniesCarousel } from "@/components/landing-page/companies-carousel";
import FAQ from "@/components/landing-page/FAQ";
import { Features } from "@/components/landing-page/solution";
import FeaturesListicle from "@/components/landing-page/FeaturesListicle";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/landing-page/Hero";
import HowItWorks from "@/components/landing-page/how-it-works";
import Pricing from "@/components/landing-page/Pricing";
import Problem from "@/components/landing-page/Problem";
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
        {/* Features*/}
        <Features />
        {/* How it works*/}
        <HowItWorks />
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
