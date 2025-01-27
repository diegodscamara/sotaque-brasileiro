import React, { JSX } from "react";

import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import hero from "@/data/hero.json";

/**
 * Hero component for the landing page.
 * Displays a title, description, and a call-to-action button with an image.
 * 
 * @returns {JSX.Element} The Hero section of the landing page.
 */
const Hero = (): JSX.Element => {
  const { title, description, buttonLink, buttonText, image, imageAlt } = hero;

  return (
    <section
      id="hero"
      className="relative flex lg:flex-row flex-col justify-center items-center gap-16 lg:gap-20 mx-auto px-4 py-16 max-w-7xl container"
    >
      <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
        <h1 className="my-6 font-extrabold text-4xl lg:text-6xl tracking-tight">
          {title}
        </h1>
        <h2 className="mb-8 max-w-xl text-muted-foreground lg:text-xl">
          {description}
        </h2>

        {/* <TestimonialsAvatars priority={true} /> */}

        <div className="flex lg:flex-row flex-col justify-center items-center gap-4">
          <Button variant="default" asChild>
            <Link href={buttonLink || "/"}>
              {buttonText || "Get Started"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="w-full md:w-fit lg:w-full">
        <Image
          src={image}
          alt={imageAlt}
          className="rounded-md w-full max-h-[600px] lg:max-h-[800px] object-cover"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
