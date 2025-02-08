import { Badge } from "@/components/ui/badge";
import ButtonCheckout from "../ButtonCheckout";
import { Card } from "../ui/card";
import { CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
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

const Pricing = () => {
  const t = useTranslations("landing.pricing");
  const getMode = (interval: string) =>
    interval !== "one-time" ? "subscription" : "payment";
  const plans = t.raw("plans") as Plan[];

  // Get unique intervals from all plan variants
  const intervals = Array.from(
    new Set(plans.flatMap((plan) => plan.variants.map((v) => v.interval)))
  );

  const [selectedInterval, setSelectedInterval] = useState(intervals[0]);

  return (
    <section className="relative mx-auto px-4 py-16 max-w-7xl container" id="pricing">
      <div className="flex flex-col gap-4 mb-16 w-full text-center">
        <h2 className="font-bold text-3xl lg:text-5xl tracking-tight">{t("title")}</h2>
        <p className="mx-auto w-full max-w-lg font-large text-base-content/80">
          {t("subtitle")}
        </p>
        <Badge variant="outline" className="mx-auto w-fit">
          {t("disclaimer")}
        </Badge>
      </div>

      <div className="flex flex-col gap-12">
        <div className="flex justify-center items-center gap-4">
          <span className="font-medium text-sm">Monthly</span>
          <Switch
            checked={selectedInterval === 'yearly'}
            onCheckedChange={(checked: boolean) => {
              setSelectedInterval(checked ? 'yearly' : 'monthly');
            }}
          />
          <span className="font-medium text-sm">Yearly</span>
        </div>

        <div className="relative flex lg:flex-row flex-col justify-center items-center lg:items-stretch gap-8">
          {plans
            .filter((plan) => plan.variants.some((v) => v.interval === selectedInterval))
            .map((plan) => {
              const variant = plan.variants.find((v) => v.interval === selectedInterval);
              return (
                <Card key={`${plan.tier}-${variant.interval}`} className={`relative bg-transparent w-full max-w-lg ${plan.isFeatured ? "border-primary h-[calc(100%+1rem)]" : "border-gray-300 dark:border-gray-500"}`}>
                  {plan.isFeatured && (
                    <div className="top-0 left-1/2 z-20 absolute -translate-x-1/2 -translate-y-1/2">
                      <Badge>{t("featured")}</Badge>
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col gap-5 lg:gap-8 bg-base-100 p-6 rounded-lg h-full">
                    <div className="flex flex-col justify-between items-start gap-4">
                      <p className="font-bold text-lg lg:text-xl">{plan.tier}</p>
                      {plan.description && (
                        <p className="text-gray-600 dark:text-gray-400">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                      <div className="flex gap-2">
                        <p className={`text-5xl font-extrabold leading-none text-gray-800 dark:text-gray-200`}>
                          ${variant.interval === "monthly" ? variant.price : variant.price / 12}
                        </p>
                        <div className="flex flex-col justify-end mb-[4px]">
                          <p className="text-gray-600 text-xs dark:text-gray-400">
                            /month
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs dark:text-gray-400">
                        {t(`billing.${variant.interval}`)}
                      </p>
                    </div>

                    <ButtonCheckout
                      priceId={process.env.NODE_ENV === 'production' ? variant.priceId.production : variant.priceId.development}
                      mode={getMode(variant.interval)}
                      variant={plan.isFeatured ? "default" : "outline"}
                    />

                    {plan.features && (
                      <ul className="space-y-2.5 text-base">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>{feature}</span>
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
    </section>
  );
};

export default Pricing;
