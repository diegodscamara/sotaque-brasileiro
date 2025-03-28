"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Calendar, GraduationCap, UserCheck } from "@phosphor-icons/react";
import { JSX, useCallback, useMemo, useRef, useState } from "react";

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
const HowItWorks = (): JSX.Element => {
  const t = useTranslations('landing.how-it-works');
  const steps: Step[] = useMemo(() => t.raw("steps"), [t]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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

  const validateStep = useCallback((step: Step): boolean => {
    return !!step.title && !!step.text && !!step.image && !!step.imageAlt;
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative flex flex-col gap-16 mx-auto px-4 py-16 max-w-7xl container"
      aria-labelledby="how-it-works-title"
    >
      <header className="flex flex-col gap-4 text-center">
        <h2 className="font-mono font-medium text-green-700 dark:text-green-500 text-sm uppercase leading-5 tracking-wider" id="how-it-works-title">
          {t("title")}
        </h2>
        <h3 className="mx-auto sm:max-w-none max-w-xs font-extrabold text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl md:text-5xl" id="how-it-works-subtitle">
          {t("subtitle")}
        </h3>
      </header>

      <div className="gap-12 grid grid-cols-1 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            {steps.map((step, index) => {
              if (!validateStep(step)) return null;
              return (
                <motion.button
                  key={step.title}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "flex gap-4 p-4 items-center transition-colors text-left border-l-2",
                    activeStep === index
                      ? "border-green-700 dark:border-green-500"
                      : "border-gray-200 dark:border-gray-600",
                  )}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "flex justify-center items-center bg-green-700/10 dark:bg-green-500/20 rounded-full w-12 h-12 text-green-700 dark:text-green-500",
                      "dark:bg-green-500/30"
                    )}>
                      {(() => {
                        const Icon = getStepIcon(step.title);
                        return Icon ? <Icon size={24} aria-hidden="true" /> : null;
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-xl leading-8">{step.title}</h4>
                    <p className={cn(
                      "text-gray-500 text-base leading-5 font-normal",
                      "dark:text-gray-400"
                    )}>{step.text}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="w-full h-64 lg:h-full"
            >
              <Image
                src={steps[activeStep].image || "/images/landing-page/how-it-works/student.jpg"}
                alt={steps[activeStep].imageAlt || "Student learning Brazilian Portuguese"}
                fill
                className="rounded-xl w-full h-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                aria-hidden={!isInView}
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
