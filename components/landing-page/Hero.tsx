import React, { JSX } from "react";

import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion"; // Importing framer-motion for animations
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
    <motion.section
      id="hero"
      className="relative flex lg:flex-row flex-col justify-center items-center gap-8 lg:gap-16 mx-auto px-4 py-20 md:py-24 lg:pt-40 lg:pb-16 max-w-7xl container"
      initial={{ opacity: 0, y: 20 }} // Initial animation state
      animate={{ opacity: 1, y: 0 }} // Animation on mount
      transition={{ duration: 0.5 }} // Animation duration
    >
      <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
        <motion.h1
          className="my-6 font-extrabold text-4xl text-gray-800 lg:text-6xl dark:text-gray-100 tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t("hero.title")}
        </motion.h1>
        <motion.h2
          className="mb-8 max-w-xl text-gray-500 lg:text-xl dark:text-gray-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {t("hero.subtitle")}
        </motion.h2>
        {/* <TestimonialsAvatars priority={true} /> */}

        <motion.div
          className="flex lg:flex-row flex-col justify-center items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button variant="default" asChild effect="shineHover">
            <Link href={t("hero.cta.link")}>
              {t("hero.cta.primary")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Image
          src={t("hero.image")}
          alt={t("hero.imageAlt")}
          className="rounded-md w-full object-cover"
          priority={true}
          width={500}
          height={500}
        />
      </motion.div>
    </motion.section>
  );
};

export default Hero;
