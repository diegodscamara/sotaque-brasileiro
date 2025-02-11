import { motion, useInView } from "framer-motion";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRef, type JSX } from "react";
import { useTranslations } from "next-intl";

/**
 * CTA component that displays a call-to-action section with animated content.
 * @returns {JSX.Element} - The rendered CTA section
 */
const CTA = (): JSX.Element => {
  const t = useTranslations("landing");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      id="cta"
      aria-labelledby="cta-title"
      className="relative bg-gray-100 dark:bg-gray-700 w-full"
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      role="region"
    >
      <div className="flex flex-col justify-center items-center gap-12 mx-auto px-4 py-16 max-w-7xl container">
        <motion.header className="space-y-4 mx-auto text-center" variants={itemVariants}>
          <h2 id="cta-title" className="font-mono font-medium text-primary text-sm uppercase leading-5 tracking-wider">
            {t("cta.title")}
          </h2>
          <h3 id="cta-subtitle" className="mx-auto sm:max-w-none max-w-xs font-extrabold text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl md:text-5xl">
            {t("cta.subtitle")}
          </h3>
          <p id="cta-description" className="mx-auto max-w-2xl font-normal text-gray-500 dark:text-gray-300 text-lg leading-8">
            {t("cta.description")}
          </p>
        </motion.header>

        <motion.div variants={itemVariants}>
          <Link href={t("cta.link")} passHref legacyBehavior>
            <Button
              variant="default"
              effect="shineHover"
              className="w-fit"
              aria-label={t("cta.button")}
            >
              {t("cta.button")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTA;