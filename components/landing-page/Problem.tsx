import { AlarmClockIcon, CookieIcon, GlobeIcon } from "lucide-react";

import React from "react";
import { useTranslations } from "next-intl";

const Step = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => {
  return (
    <div className="blur(0px); transform: translateY(-6px); 1; auto; filter: opacity: will-change:">
      <div className="bg-background shadow-none border border-none rounded-lg text-card-foreground">
        <div className="space-y-4 p-6">
          <div className="flex justify-center items-center bg-primary/10 rounded-full w-12 h-12">
            {icon}
          </div>
          <h3 className="font-semibold text-xl leading-8">{title}</h3>
          <p className="text-base text-muted-foreground leading-5">{text}</p>
        </div>
      </div>
    </div>
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
  return (
    <section id="problem" className="relative flex flex-col items-center gap-16 mx-auto px-4 py-16 max-w-7xl container">
      <div className="flex flex-col items-center gap-4 mx-auto text-center">
        <h2 className="font-medium font-mono text-primary text-sm uppercase tracking-wider">
          {t('title')}
        </h2>
        <h3 className="mx-auto max-w-xs sm:max-w-none font-extrabold text-3xl sm:text-4xl md:text-5xl leading-none">
          {t('subtitle')}
        </h3>
      </div>

      <div className="sm:gap-8 md:gap-10 lg:gap-12 grid grid-cols-1 md:grid-cols-3">
        <Step icon={<AlarmClockIcon className="w-6 h-6 text-primary" />} title={t('cards.0.title')} text={t('cards.0.text')} />

        <Step icon={<CookieIcon className="w-6 h-6 text-primary" />} title={t('cards.1.title')} text={t('cards.1.text')} />

        <Step icon={<GlobeIcon className="w-6 h-6 text-primary" />} title={t('cards.2.title')} text={t('cards.2.text')} />
      </div>
    </section>
  );
};

export default Problem;
