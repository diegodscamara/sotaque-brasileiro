import ButtonCheckout from "../ButtonCheckout";
import PricingTabs from "./PricingTabs";
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

  const tabs = intervals.map((interval) => ({
    id: interval,
    title: interval.charAt(0).toUpperCase() + interval.slice(1),
    content: (
      <div className="relative flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-stretch">
        {config.stripe.plans
          .filter((plan) => plan.interval === interval)
          .map((plan) => (
            <div key={plan.priceId} className="relative w-full max-w-lg">
              {plan.isFeatured && (
                <div className="absolute top-0 z-20 -translate-x-1/2 -translate-y-1/2 left-1/2">
                  <span
                    className={`badge text-xs text-primary-content font-semibold border-0 bg-accent`}
                  >
                    POPULAR
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-accent z-10`}
                ></div>
              )}

              <div className="relative z-10 flex flex-col h-full gap-5 p-8 rounded-lg lg:gap-8 bg-base-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold lg:text-xl">{plan.name}</p>
                    {plan.description && (
                      <p className="mt-2 text-base-content/80">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {plan.priceAnchor && (
                    <div className="flex flex-col justify-end mb-[4px] text-lg ">
                      <p className="relative">
                        <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                        <span className="text-base-content/80">
                          ${plan.priceAnchor}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className={`text-5xl tracking-tight font-extrabold`}>
                    ${plan.price}
                  </p>
                  <div className="flex flex-col justify-end mb-[4px]">
                    <p className="text-xs font-semibold uppercase text-base-content/60">
                      CAD
                    </p>
                  </div>
                </div>
                {plan.features && (
                  <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-[18px] h-[18px] opacity-80 shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>

                        <span>{feature.name} </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-2">
                  <ButtonCheckout
                    priceId={plan.priceId}
                    mode={getMode(plan.interval)}
                  />
                  <p className="relative flex items-center justify-center gap-2 text-sm font-medium text-center text-base-content/80">
                    Pay once. Access forever.
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
    ),
  }));

  return (
    <section className="overflow-hidden bg-base-200" id="pricing">
      <div className="max-w-5xl px-8 py-24 mx-auto">
        <div className="flex flex-col w-full mb-20 text-center">
          <p className="mb-8 font-medium text-primary">Pricing</p>
          <h2 className="text-3xl font-bold tracking-tight lg:text-5xl">
            Save hours of repetitive code and ship faster!
          </h2>
        </div>

        <PricingTabs tabs={tabs} />
      </div>
    </section>
  );
};

export default Pricing;
