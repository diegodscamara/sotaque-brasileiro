import { BrainIcon, LightbulbIcon, ShieldIcon } from "lucide-react";

import React from "react";

const Step = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => {
  return (
    <div className="blur(0px); transform: translateY(-6px); 1; auto; filter: opacity: will-change:">
      <div className="bg-background shadow-none border border-none rounded-lg text-card-foreground">
        <div className="space-y-4 p-6">
          <div className="flex justify-center items-center bg-primary/10 rounded-full w-12 h-12">
            {icon}
          </div>
          <h3 className="font-semibold text-xl">{title}</h3>
          <p className="text-muted-foreground">{text}</p>
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
  return (
    <section className="container">
      <div className="relative mx-auto px-4 py-16 max-w-7xl container">
        <div className="space-y-4 mx-auto pb-6 text-center">
          <h2 className="font-medium font-mono text-primary text-sm uppercase tracking-wider">
            Problem
          </h2>
          <h3 className="mx-auto mt-4 max-w-xs sm:max-w-none font-semibold text-3xl sm:text-4xl md:text-5xl">
            Manually entering your data is a hassle.
          </h3>
        </div>

        <div className="gap-8 grid grid-cols-1 md:grid-cols-3 mt-12">
          <Step icon={<BrainIcon className="w-6 h-6 text-primary" />} title="Data Overload" text="Businesses struggle to make sense of vast amounts of complex data, missing out on valuable insights that could drive growth and innovation." />

          <Step icon={<LightbulbIcon className="w-6 h-6 text-primary" />} title="Slow Decision-Making" text="Traditional data processing methods are too slow, causing businesses to lag behind market changes and miss crucial opportunities." />

          <Step icon={<ShieldIcon className="w-6 h-6 text-primary" />} title="Data Security Concerns" text="With increasing cyber threats, businesses worry about the safety of their sensitive information when adopting new technologies." />
        </div>
      </div>
    </section>
  );
};

export default Problem;
