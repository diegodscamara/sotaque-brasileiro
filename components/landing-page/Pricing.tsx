import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import ButtonCheckout from "../ButtonCheckout";
import { Card } from "../ui/card";
import { CheckCircle } from "lucide-react";
import config from "@/config";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

const Pricing = () => {
  const getMode = (interval: string) =>
    interval !== "one-time" ? "subscription" : "payment";
  const intervals = Array.from(
    new Set(config.stripe.plans.map((plan) => plan.interval))
  );

  return (
    <section className="container" id="pricing">
      <div className="mx-auto py-24">
        <div className="flex flex-col gap-4 mb-16 w-full text-center">
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight">Pricing</h2>
          <p className="mx-auto w-full max-w-lg font-large text-base-content/80">
            Choose the plan that&apos;s right for you
          </p>
          <Badge variant="outline" className="mx-auto w-fit">Save up to 17% with annual plans!</Badge>
        </div>

        <Tabs defaultValue={intervals[0]} className="flex flex-col items-center gap-8 w-full">
          <TabsList>
            {intervals.map((interval) => (
              <TabsTrigger key={interval} value={interval}>
                {interval.charAt(0).toUpperCase() + interval.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {intervals.map((interval) => (
            <TabsContent key={interval} value={interval}>
              <div className="relative flex lg:flex-row flex-col justify-center items-center lg:items-stretch gap-8">
                {config.stripe.plans
                  .filter((plan) => plan.interval === interval)
                  .map((plan) => (
                    <Card key={plan.priceId} className={`relative w-full max-w-lg ${plan.isFeatured ? "border-primary" : ""}`}>
                      {plan.isFeatured && (
                        <div className="top-0 left-1/2 z-20 absolute -translate-x-1/2 -translate-y-1/2">
                          <Badge>
                            POPULAR
                          </Badge>
                        </div>
                      )}

                      <div className="relative z-10 flex flex-col gap-5 lg:gap-8 bg-base-100 p-8 rounded-lg h-full">
                        <div className="flex flex-col justify-between items-start gap-4">
                          <p className="font-bold text-lg lg:text-xl">{plan.name}</p>
                          {plan.description && (
                            <p className="text-base-content/50">
                              {plan.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col justify-end gap-2">
                          <div className="flex gap-2">
                            {plan.priceAnchor && (
                              <div className="flex flex-col justify-end mb-[4px] text-lg">
                                <p className="relative">
                                  <span className="top-[53%] absolute inset-x-0 bg-base-content h-[1.5px]"></span>
                                  <span className="text-base-content/80">
                                    ${plan.priceAnchor}
                                  </span>
                                </p>
                              </div>
                            )}
                            <p className={`text-5xl tracking-tight font-extrabold`}>
                              ${plan.interval === "monthly" ? plan.price : plan.price / 12}
                            </p>
                            <div className="flex flex-col justify-end mb-[4px]">
                              <p className="text-base-content/60 text-xs">
                                /month
                              </p>
                            </div>
                          </div>
                          <p className="text-base-content/60 text-xs">
                            {plan.interval === "monthly"
                              ? "Billed monthly"
                              : "Billed annually"}
                          </p>
                        </div>

                        <ButtonCheckout
                          priceId={plan.priceId}
                          mode={getMode(plan.interval)}
                          variant={plan.isFeatured ? "default" : "outline"}
                        />

                        {plan.features && (
                          <ul className="space-y-2.5 text-base">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>{feature.name} </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default Pricing;
