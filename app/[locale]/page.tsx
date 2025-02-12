"use client";

import CTA from "@/components/landing-page/CTA";
import { CompaniesCarousel } from "@/components/landing-page/companies-carousel";
import FAQ from "@/components/landing-page/FAQ";
import { Features } from "@/components/landing-page/solution";
import Footer from "@/components/landing-page/Footer";
import Header from "@/components/landing-page/Header";
import Hero from "@/components/landing-page/Hero";
import HowItWorks from "@/components/landing-page/how-it-works";
import Pricing from "@/components/landing-page/Pricing";
import Problem from "@/components/landing-page/Problem";
import { Suspense } from 'react'
import Testimonials from "@/components/landing-page/testimonials";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex flex-col justify-center items-center mx-auto">
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
        <Testimonials />
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
