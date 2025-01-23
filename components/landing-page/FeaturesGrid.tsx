import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
/* eslint-disable @next/next/no-img-element */
import React from "react";

const features = [
  {
    title: "Collect user feedback",
    description:
      "Use your Insighto's board to let users submit features they want.",
    styles: "bg-accent text-primary-content",
    demo: (
      <Card className="bg-accent text-primary-content">
        <h6>Suggest a feature</h6>
        <div className="group-hover:bg-base-100 relative bg-base-200 mr-12 py-4 group-hover:border-border h-full text-base-content textarea">
          <div className="top-4 left-4 absolute flex items-center group-hover:hidden">
            <span>Notifica</span>
            <span className="bg-accent w-[2px] h-6 animate-pulse"></span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 duration-500">
            Notifications should be visible only on certain pages.
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 duration-1000">
            <span>Terms & privacy pages don&apos;t need them</span>
            <span className="bg-accent w-[2px] h-6 animate-pulse"></span>
          </div>
          <Button className="right-4 bottom-6 absolute opacity-0 group-hover:opacity-100 shadow-lg duration-1000">
            Submit
          </Button>
        </div>
      </Card>
    ),
  },
  {
    title: "Prioritize features",
    description: "Users upvote features they want. You know what to ship next.",
    styles: "md:col-span-2 bg-base-300 text-base-content",
    demo: (
      <div className="flex flex-col gap-4 px-6 max-w-[600px] overflow-hidden">
        {[
          {
            text: "Add LemonSqueezy integration to the boilerplate",
            secondaryText: "Yes, ship this! ✅",
            votes: 48,
            transition: "group-hover:-mt-36 group-hover:md:-mt-28 duration-500",
          },
          {
            text: "A new pricing table for metered billing",
            secondaryText: "Maybe ship this 🤔",
            votes: 12,
          },
          {
            text: "A new UI library for the dashboard",
            secondaryText: "But don't ship that ❌",
            votes: 1,
          },
        ].map((feature, i) => (
          <Card key={i} className="flex justify-between gap-4 bg-base-100 mb-2 p-4 rounded-box text-base-content">
            <div>
              <p>{feature.text}</p>
              <p className="text-base-content-secondary">
                {feature.secondaryText}
              </p>
            </div>
            <Button className="bg-accent px-4 py-2 border border-transparent rounded-box text-center text-lg text-primary-content duration-150 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-5 h-5 ease-in-out duration-150 -translate-y-0.5 group-hover:translate-y-0`}
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
              {feature.votes}
            </Button>
          </Card>
        ))}
      </div>
    ),
  },
  {
    title: "Your brand, your board",
    description: "Customize your Insighto board with 7 themes.",
    styles: "md:col-span-2 bg-base-100 text-base-content",
    demo: (
      <div className="left-0 flex -mt-4 pt-0 lg:pt-8 w-full h-full overflow-hidden">
        <div className="flex lg:pt-4 min-w-max h-full overflow-x-visible -rotate-[8deg]">
          {[
            {
              buttonStyles: "bg-accent text-primary-content",
              css: "-ml-1 rotate-[6deg] w-72 h-72 z-30 bg-base-200 text-base-content rounded-2xl group-hover:-ml-64 group-hover:opacity-0 group-hover:scale-75 transition-all duration-500 p-4",
            },
            {
              buttonStyles: "bg-accent text-secondary-content",
              css: "rotate-[6deg] bg-base-200 text-base-content w-72 h-72 -mr-20 -ml-20 z-20 rounded-xl p-4",
            },
            {
              buttonStyles: "bg-accent text-accent-content",
              css: "rotate-[6deg] bg-base-200 text-base-content z-10 w-72 h-72 rounded-xl p-4",
            },
            {
              buttonStyles: "bg-neutral text-neutral-content",
              css: "rotate-[6deg] bg-base-200 text-base-content w-72 h-72 -ml-20 rounded-xl p-4",
            },
            {
              buttonStyles: "bg-base-100 text-base-content",
              css: "rotate-[6deg] bg-base-200 text-base-content w-72 h-72 -ml-10 -z-10 rounded-xl p-4 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300",
            },
          ].map((theme, i) => (
            <Card key={i} className={theme.css}>
              <div className="mb-3 font-medium text-base-content/60 text-sm uppercase tracking-wide">
                Trending feedback
              </div>
              <div className="space-y-2">
                <div className="flex justify-between bg-base-100 p-4 rounded-box">
                  <div>
                    <p className="mb-1 font-semibold">Clickable cards</p>
                    <p className="opacity-80">Make cards more accessible</p>
                  </div>
                  <Button
                    className={`px-4 py-2 rounded-box group text-center text-lg duration-150 border border-transparent ${theme.buttonStyles}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-5 h-5 ease-in-out duration-150 -translate-y-0.5 group-hover:translate-y-0`}
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                    8
                  </Button>
                </div>
                <div className="flex justify-between bg-base-100 p-4 rounded-box">
                  <div>
                    <p className="mb-1 font-semibold">Bigger images</p>
                    <p className="opacity-80">Make cards more accessible</p>
                  </div>
                  <Button
                    className={`px-4 py-2 rounded-box group text-center text-lg duration-150 border border-transparent ${theme.buttonStyles}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-5 h-5 ease-in-out duration-150 -translate-y-0.5 group-hover:translate-y-0`}
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                    5
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Discover new ideas",
    description: "Users can chat and discuss features.",
    styles: "bg-neutral text-neutral-content",
    demo: (
      <div className="space-y-4 px-6 text-neutral-content">
        {[
          {
            id: 1,
            text: "Can we have a feature to add a custom domain to IndiePage?",
            userImg:
              "https://pbs.twimg.com/profile_images/1514863683574599681/9k7PqDTA_400x400.jpg",
            userName: "Marc Lou",
            createdAt: "2024-09-01T00:00:00Z",
          },
          {
            id: 2,
            text: "I'd definitelly pay for that 🤩",
            userImg:
              "https://pbs.twimg.com/profile_images/1778434561556320256/knBJT1OR_400x400.jpg",
            userName: "Dan K.",
            createdAt: "2024-09-02T00:00:00Z",
            transition:
              "opacity-0 group-hover:opacity-100 duration-500 translate-x-1/4 group-hover:translate-x-0",
          },
        ]?.map((reply) => (
          <Card
            key={reply.id}
            className={`px-6 py-4 bg-neutral-content text-neutral rounded-box ${reply?.transition}`}
          >
            <div className="mb-2 whitespace-pre-wrap">{reply.text}</div>
            <div className="flex items-center gap-2 text-neutral/80 text-sm">
              <div className="flex items-center gap-2">
                <div className="avatar">
                  <div className="rounded-full w-7">
                    <img src={reply.userImg} alt={reply.userName} />
                  </div>
                </div>
                <div className=""> {reply.userName} </div>
              </div>
              •
              <div>
                {new Date(reply.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    ),
  },
];

const FeaturesGrid = () => {
  return (
    <section className="flex justify-center items-center bg-base-200/50 py-20 lg:py-32 w-full text-base-content">
      <div className="flex flex-col gap-16 md:gap-20 px-4 max-w-[82rem]">
        <h2 className="max-w-3xl font-black text-4xl md:text-6xl tracking-[-0.01em]">
          Ship features <br /> users{" "}
          <span className="underline underline-offset-8 decoration-base-300 decoration-dashed">
            really want
          </span>
        </h2>
        <div className="flex flex-col gap-4 lg:gap-10 w-full max-w-[82rem] h-fit text-text-default">
          <div className="gap-4 lg:gap-10 grid grid-cols-1 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className={`${feature.styles} rounded-3xl flex flex-col gap-6 w-full h-[22rem] lg:h-[25rem] pt-6 overflow-hidden group`}>
                <div className="space-y-2 px-6">
                  <h3 className="font-bold text-xl lg:text-3xl tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="opacity-80">{feature.description}</p>
                </div>
                {feature.demo}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
