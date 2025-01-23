"use client";

import CTA from "@/components/landing-page/CTA";
import { CompaniesCarousel } from "@/components/landing-page/companies-carousel";
import FAQ from "@/components/landing-page/FAQ";
import FeaturesAccordion from "@/components/landing-page/FeaturesAccordion";
import FeaturesListicle from "@/components/landing-page/FeaturesListicle";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/landing-page/Hero";
import Image from "next/image";
import Marquee from "@/components/ui/marquee";
import Pricing from "@/components/landing-page/Pricing";
import Problem from "@/components/landing-page/Problem";
import { Solution } from "@/components/landing-page/solution";
import { Suspense } from 'react'
import Testimonials3 from "@/components/landing-page/Testimonials3";
import { cn } from "@/libs/utils";

export default function Home() {
  const reviews = [
    {
      name: "Jack",
      username: "@jack",
      body: "I've never seen anything like this before. It's amazing. I love it.",
      img: "https://avatar.vercel.sh/jack",
    },
    {
      name: "Jill",
      username: "@jill",
      body: "I don't know what to say. I'm speechless. This is amazing.",
      img: "https://avatar.vercel.sh/jill",
    },
    {
      name: "John",
      username: "@john",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/john",
    },
    {
      name: "Jane",
      username: "@jane",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/jane",
    },
    {
      name: "Jenny",
      username: "@jenny",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/jenny",
    },
    {
      name: "James",
      username: "@james",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/james",
    },
  ];

  const firstRow = reviews.slice(0, reviews.length / 2);
  const secondRow = reviews.slice(reviews.length / 2);

  const ReviewCard = ({
    img,
    name,
    username,
    body,
  }: {
    img: string;
    name: string;
    username: string;
    body: string;
  }) => {
    return (
      <figure
        className={cn(
          "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
          // light styles
          "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
          // dark styles
          "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        )}
      >
        <div className="flex flex-row items-center gap-2">
          <Image className="rounded-full" width="32" height="32" alt="" src={img} />
          <div className="flex flex-col">
            <figcaption className="font-medium text-sm dark:text-white">
              {name}
            </figcaption>
            <p className="font-medium text-xs dark:text-white/40">{username}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm">{body}</blockquote>
      </figure>
    );
  };

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
        {/* Testimonials*/}
        <div className="relative flex flex-col justify-center items-center bg-background md:shadow-xl border border-border rounded-lg w-full h-[500px] overflow-hidden container">
          <Marquee pauseOnHover className="[--duration:20s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:20s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="left-0 absolute inset-y-0 bg-gradient-to-r from-white dark:from-background w-1/3 pointer-events-none"></div>
          <div className="right-0 absolute inset-y-0 bg-gradient-to-l from-white dark:from-background w-1/3 pointer-events-none"></div>
        </div>
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
