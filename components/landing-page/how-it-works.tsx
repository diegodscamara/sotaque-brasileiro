"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, GraduationCap, UserCheck } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";

import Image from "next/image";
import PropTypes from 'prop-types';
import { cn } from "@/libs/utils";
import { useTranslations } from "next-intl";

interface Step {
  title: string;
  text: string;
  image: string;
  imageAlt: string;
}

/**
 * HowItWorks component displays the steps for using the service.
 * @returns {JSX.Element} - The rendered component.
 */
const HowItWorks = () => {
  const t = useTranslations('landing.how-it-works');
  const steps: Step[] = useMemo(() => t.raw("steps"), [t]);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Dynamic STEP_ICONS based on current language
  const STEP_ICONS = useMemo(() => ({
    [steps[0].title]: UserCheck,
    [steps[1].title]: Calendar,
    [steps[2].title]: GraduationCap,
  }), [steps]);

  const getStepIcon = useCallback((title: string) => {
    return STEP_ICONS[title as keyof typeof STEP_ICONS] || null;
  }, [STEP_ICONS]);

  const handleStepClick = useCallback((index: number) => {
    setActiveStep(index);
  }, []);

  return (
    <section id="how-it-works" className="relative flex flex-col gap-16 mx-auto px-4 py-16 max-w-7xl container" aria-labelledby="how-it-works-title">
      <div className="flex flex-col gap-4 text-center">
        <h2 className="font-medium font-mono text-primary text-sm uppercase leading-5 tracking-wider" id="how-it-works-title">
          {t("title")}
        </h2>
        <h3 className="mx-auto max-w-xs sm:max-w-none font-extrabold text-3xl text-gray-800 sm:text-4xl md:text-5xl dark:text-gray-100" id="how-it-works-subtitle">
          {t("subtitle")}
        </h3>
      </div>

      <div className="gap-12 grid grid-cols-1 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            {steps.map((step, index) => (
              <motion.button
                key={step.title}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "flex gap-4 p-4 items-center transition-colors text-left border-l-2",
                  activeStep === index
                    ? "border-primary"
                    : "border-gray-200 dark:border-gray-600",
                )}
                aria-label={`Step ${index + 1}: ${step.title}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="flex-shrink-0">
                  <div className={cn(
                    "flex justify-center items-center bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12 text-primary",
                    "dark:bg-primary/30"
                  )}>
                    {(() => {
                      const Icon = getStepIcon(step.title);
                      return Icon ? <Icon size={24} aria-hidden="true" /> : null;
                    })()}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-gray-800 text-xl dark:text-gray-100 leading-8">{step.title}</h4>
                  <p className={cn(
                    "text-gray-500 text-base leading-5 font-normal",
                    "dark:text-gray-400"
                  )}>{step.text}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0" style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full h-64 lg:h-full"
            >
              <Image
                src={steps[activeStep].image || "/images/landing-page/how-it-works/student.jpg"}
                alt={steps[activeStep].imageAlt || "Student learning Brazilian Portuguese"}
                layout="fill"
                objectFit="cover"
                className="rounded-xl w-full h-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

HowItWorks.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    imageAlt: PropTypes.string.isRequired,
  })),
};

export default HowItWorks;
