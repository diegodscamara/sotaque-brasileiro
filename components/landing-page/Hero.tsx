import React, { JSX } from "react";

import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';

/**
 * Hero component for the landing page.
 * Displays a title, description, and a call-to-action button with an image.
 * 
 * @returns {JSX.Element} The Hero section of the landing page.
 */
const Hero = (): JSX.Element => {
  const t = useTranslations('landing');

  return (
    <section
      id="hero"
      className="relative flex lg:flex-row flex-col justify-center items-center gap-16 lg:gap-20 mx-auto px-4 py-40 max-w-7xl container"
    >
      <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
        <h1 className="my-6 font-extrabold text-4xl text-gray-800 lg:text-6xl dark:text-gray-100 tracking-tight">
          {t("hero.title")}
        </h1>
        <h2 className="mb-8 max-w-xl text-gray-500 lg:text-xl dark:text-gray-300">
          {t("hero.subtitle")}
        </h2>
        {/* <TestimonialsAvatars priority={true} /> */}

        <div className="flex lg:flex-row flex-col justify-ce∏nter items-center gap-4">
          <Button variant="default" asChild>
            <Link href={t("hero.cta.link")}>
              {t("hero.cta.primary")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="w-full">
        <Image
          src={t("hero.image")}
          alt={t("hero.imageAlt")}
          className="rounded-md w-full object-cover"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
