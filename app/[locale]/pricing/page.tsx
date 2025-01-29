"use client";

import FAQ from "@/components/landing-page/FAQ";
import Pricing from "@/components/landing-page/Pricing";

export default function SignIn() {

  return (
    <section className="flex flex-col justify-center items-center mx-auto py-24 w-full h-full container">
      <Pricing />
      <FAQ />
    </section>
  );
}
