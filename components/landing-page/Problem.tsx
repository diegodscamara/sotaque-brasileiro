import { AlarmClockIcon, CookieIcon, GlobeIcon } from "lucide-react";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { useTranslations } from "next-intl";

interface StepProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

/**
 * Renders an individual problem step card with animation
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} title - Title of the step
 * @param {string} text - Description of the step
 * @returns {JSX.Element} Animated step component
 */
const Step = ({ icon, title, text }: StepProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      aria-labelledby={`step-title-${title}`}
    >
      <div className="shadow-none border border-none rounded-lg text-card-foreground">
        <div className="space-y-4">
          <div
            className="flex justify-center items-center bg-primary/10 dark:bg-primary/20 rounded-full w-12 h-12"
            aria-hidden="true"
          >
            {icon}
          </div>
          <h3
            id={`step-title-${title}`}
            className="font-semibold text-gray-800 dark:text-gray-100 text-xl leading-8"
          >
            {title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-5">
            {text}
          </p>
        </div>
      </div>
    </motion.article>
  );
};

// Problem Agitation: A crucial, yet overlooked, component for a landing page that sells.
// It goes under your Hero section, and above your Features section.
// Your Hero section makes a promise to the customer: "Our product will help you achieve XYZ".
// Your Problem section explains what happens to the customer if its problem isn't solved.
// The copy should NEVER mention your product. Instead, it should dig the emotional outcome of not fixing a problem.
// For instance:
// - Hero: "ShipFast helps developers launch startups fast"
// - Problem Agitation: "Developers spend too much time adding features, get overwhelmed, and quit." (not about ShipFast at all)
// - Features: "ShipFast has user auth, Stripe, emails all set up for you"
const Problem = () => {
  const t = useTranslations('landing.problem');
  const sectionRef = useRef<HTMLElement>(null);
  const isSectionInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative flex flex-col items-center gap-16 mx-auto px-4 py-16 max-w-7xl container"
      aria-labelledby="problem-heading"
    >
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-4 mx-auto text-center"
      >
        <h2 className="font-mono font-medium text-green-700 dark:text-green-500 text-sm uppercase tracking-wider">
          {t('title')}
        </h2>
        <h3
          id="problem-heading"
          className="mx-auto sm:max-w-none max-w-xs font-extrabold text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl md:text-5xl"
        >
          {t('subtitle')}
        </h3>
      </motion.header>

      <div
        className="gap-8 md:gap-10 lg:gap-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Problem solution steps"
      >
        <div role="listitem">
          <Step
            icon={<AlarmClockIcon className="w-6 h-6 text-primary" aria-hidden="true" />}
            title={t('cards.0.title')}
            text={t('cards.0.text')}
          />
        </div>
        <div role="listitem">
          <Step
            icon={<CookieIcon className="w-6 h-6 text-primary" aria-hidden="true" />}
            title={t('cards.1.title')}
            text={t('cards.1.text')}
          />
        </div>
        <div role="listitem">
          <Step
            icon={<GlobeIcon className="w-6 h-6 text-primary" aria-hidden="true" />}
            title={t('cards.2.title')}
            text={t('cards.2.text')}
          />
        </div>
      </div>
    </section>
  );
};

export default Problem;
