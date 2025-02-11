import { JSX, useState } from "react";

import { Badge } from "@/components/ui/badge";
import ButtonCheckout from "@/components/ButtonCheckout";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslations } from "next-intl";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

interface PlanVariant {
  priceId: { development: string; production: string };
  interval: string;
  price: number;
  units: number;
}

interface Plan {
  tier: string;
  description: string;
  isFeatured?: boolean;
  features: string[];
  variants: PlanVariant[];
}

/**
 * Pricing component displays available subscription plans with their features and pricing.
 * @returns {JSX.Element} - Rendered pricing section with interactive plan selection
 */
const Pricing = (): JSX.Element => {
  const t = useTranslations("landing.pricing");
  const plans = t.raw("plans") as Plan[];

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const getMode = (interval: string) =>
    interval !== "one-time" ? "subscription" : "payment";

  const intervals = Array.from(
    new Set(plans.flatMap((plan) => plan.variants.map((v) => v.interval)))
  ).filter(Boolean);

  const [selectedInterval, setSelectedInterval] = useState(intervals[0] || 'monthly');

  const handleIntervalChange = (checked: boolean) => {
    setSelectedInterval(checked ? 'yearly' : 'monthly');
  };

  const getMonthlyPrice = (variant: PlanVariant) =>
    variant.interval === "monthly" ? variant.price : variant.price / 12;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex flex-col gap-8 mx-auto px-4 py-16 max-w-7xl container"
      id="pricing"
      aria-labelledby="pricing-title"
    >
      <header className="flex flex-col gap-4 text-center">
        <h2
          className="font-mono font-medium text-primary text-sm uppercase leading-5 tracking-wider"
          id="pricing-title"
        >
          {t("title")}
        </h2>
        <h3
          className="mx-auto sm:max-w-none max-w-xs font-extrabold text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl md:text-5xl"
          id="pricing-subtitle"
        >
          {t("subtitle")}
        </h3>
      </header>

      <div className="flex flex-col gap-12">
        <div
          className="flex justify-center items-center gap-4"
          role="radiogroup"
          aria-label="Select billing interval"
        >
          <span className="font-medium text-gray-800 dark:text-gray-200 text-base leading-7">
            {t(`intervals.monthly`)}
          </span>
          <Switch
            checked={selectedInterval === 'yearly'}
            onCheckedChange={handleIntervalChange}
            aria-label="Toggle between monthly and yearly billing"
          />
          <span className="font-medium text-gray-800 dark:text-gray-200 text-base leading-7">
            {t(`intervals.yearly`)}
          </span>
        </div>

        <div className="relative items-end gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans
            .filter((plan) => plan.variants.some((v) => v.interval === selectedInterval))
            .map((plan) => {
              const variant = plan.variants.find((v) => v.interval === selectedInterval);
              if (!variant) return null;

              return (
                <Card
                  key={`${plan.tier}-${variant.interval}`}
                  className={`relative bg-transparent shadow-none w-full ${plan.isFeatured ? "border-primary h-full lg:h-[calc(100%+1rem)]" : "border-gray-300 dark:border-gray-500"
                    }`}
                  aria-labelledby={`${plan.tier}-title`}
                >
                  {plan.isFeatured && (
                    <div className="top-0 left-1/2 z-20 absolute -translate-x-1/2 -translate-y-1/2">
                      <Badge>{t("featured")}</Badge>
                    </div>
                  )}

                  <div className="z-10 relative flex flex-col gap-6 bg-base-100 p-6 rounded-lg h-full">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col justify-between items-start gap-4">
                        <h4
                          className="font-semibold text-lg lg:text-xl leading-8"
                          id={`${plan.tier}-title`}
                        >
                          {plan.tier}
                        </h4>
                        {plan.description && (
                          <p className="font-normal text-gray-600 dark:text-gray-400 text-base leading-5">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col justify-end gap-2">
                        <div className="flex gap-2">
                          <p className="font-extrabold text-gray-800 dark:text-gray-200 text-5xl leading-none">
                            ${getMonthlyPrice(variant).toFixed()}
                          </p>
                          <div className="flex flex-col justify-end mb-[4px]">
                            <p className="font-normal text-gray-600 dark:text-gray-400 text-xs leading-5">
                              /{t(`period.${variant.interval}`)}
                            </p>
                          </div>
                        </div>
                        <p className="font-normal text-gray-600 dark:text-gray-400 text-xs leading-5">
                          {t(`billing.${variant.interval}`)}
                        </p>
                      </div>
                    </div>

                    <ButtonCheckout
                      priceId={process.env.NODE_ENV === 'production'
                        ? variant.priceId.production
                        : variant.priceId.development}
                      mode={getMode(variant.interval)}
                      variant={plan.isFeatured ? "default" : "outline"}
                      aria-label={`Subscribe to ${plan.tier} plan`}
                    />

                    {plan.features && (
                      <ul className="space-y-2.5 text-base">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-4">
                            <div
                              className="flex justify-center items-center bg-primary/10 dark:bg-primary/20 rounded-full w-4 h-4"
                              aria-hidden="true"
                            >
                              <Check className="w-2 h-2 text-primary dark:text-primary" />
                            </div>
                            <span className="font-normal text-gray-800 dark:text-gray-200 text-base leading-5">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Card>
              );
            })}
        </div>
      </div>

      <p className="font-normal text-gray-600 dark:text-gray-400 text-sm text-center leading-5">
        {t("disclaimer")}
      </p>
    </motion.section>
  );
};

export default Pricing;
