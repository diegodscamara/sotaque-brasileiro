"use client";

import { useEffect, useRef, useState } from "react";

import type { JSX } from "react";

// List of features to display:
// - name: name of the feature
// - content: content of the feature (can be any JSX)
// - svg: icon of the feature
const features: {
  name: string;
  description: string;
  content: JSX.Element;
  svg: JSX.Element;
}[] = [
    {
      name: "AI-Powered Dashboard",
      description: "Visualize trends and gain insights at a glance.",
      content: (
        <>
          <ul className="space-y-1">
            {[
              "Send transactional emails",
              "DNS setup to avoid spam folder (DKIM, DMARC, SPF in subdomain)",
              "Webhook to receive & forward emails",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="inline opacity-80 w-[18px] h-[18px] shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>

                {item}
              </li>
            ))}
            <li className="flex items-center gap-3 font-medium text-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="inline w-[18px] h-[18px] shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Time saved: 2 hours
            </li>
          </ul>
        </>
      ),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
          />
        </svg>
      ),
    },
    {
      name: "Natural Language Processing",
      description: "Analyze text and extract sentiment effortlessly.",
      content: (
        <>
          <ul className="space-y-2">
            {[
              "Create checkout sessions",
              "Handle webhooks to update user's account",
              "Tips to setup your account & reduce chargebacks",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="inline opacity-80 w-[18px] h-[18px] shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>

                {item}
              </li>
            ))}
            <li className="flex items-center gap-3 font-medium text-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="inline w-[18px] h-[18px] shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Time saved: 2 hours
            </li>
          </ul>
        </>
      ),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      ),
    },
    {
      name: "Predictive Analytics",
      description: "Forecast trends and make data-driven decisions.",
      content: (
        <>
          <ul className="space-y-2">
            {[
              "Magic links setup",
              "Login with Google walkthrough",
              "Save user data in MongoDB",
              "Private/protected pages & API calls",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="inline opacity-80 w-[18px] h-[18px] shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>

                {item}
              </li>
            ))}
            <li className="flex items-center gap-3 font-medium text-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="inline w-[18px] h-[18px] shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Time saved: 3 hours
            </li>
          </ul>
        </>
      ),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      name: "Automated Reporting",
      description: "Generate comprehensive reports with one click.",
      content: (
        <>
          <ul className="space-y-2">
            {["Mongoose schema", "Mongoose plugins to make your life easier"].map(
              (item) => (
                <li key={item} className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="inline opacity-80 w-[18px] h-[18px] shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>

                  {item}
                </li>
              )
            )}
            <li className="flex items-center gap-3 font-medium text-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="inline w-[18px] h-[18px] shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Time saved: 2 hours
            </li>
          </ul>
        </>
      ),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
          />
        </svg>
      ),
    }
  ];

// A list of features with a listicle style.
// - Click on a feature to display its content.
// - Good to use when multiples features are available.
// - Autoscroll the list of features (optional).
const FeaturesListicle = () => {
  const featuresEndRef = useRef<null>(null);
  const [featureSelected, setFeatureSelected] = useState<string>(
    features[0].name
  );
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  // (Optional) Autoscroll the list of features so user know it's interactive.
  // Stop scrolling when user scroll after the featuresEndRef element (end of section)
  // emove useEffect is not needed.
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasClicked) {
        const index = features.findIndex(
          (feature) => feature.name === featureSelected
        );
        const nextIndex = (index + 1) % features.length;
        setFeatureSelected(features[nextIndex].name);
      }
    }, 5000);

    try {
      // stop the interval when the user scroll after the featuresRef element
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            clearInterval(interval);
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.5,
        }
      );
      if (featuresEndRef.current) {
        observer.observe(featuresEndRef.current);
      }
    } catch (e) {
      console.error(e);
    }

    return () => clearInterval(interval);
  }, [featureSelected, hasClicked]);

  return (
    <section id="features" className="relative mx-auto px-4 py-16 max-w-7xl container">
      <div className="space-y-4 mx-auto pb-6 text-center">
        <h2 className="font-medium font-mono text-primary text-sm uppercase tracking-wider">
          {/* 💡 COPY TIP: Remind visitors about the value of your product. Why do they need it? */}
          Features
        </h2>
        <h3 className="mx-auto mt-4 max-w-xs sm:max-w-none font-semibold text-3xl sm:text-4xl md:text-5xl">
          {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
          User Flows and Navigational Structures
        </h3>
      </div>
      <div className="gap-x-10 grid md:grid-cols-4 mx-auto py-8 max-w-7xl container">
        {features.map((feature) => (
          <span
            key={feature.name}
            onClick={() => {
              if (!hasClicked) setHasClicked(true);
              setFeatureSelected(feature.name);
            }}
            className="relative flex flex-col items-center cursor-pointer"
          >
            <span
              className={`duration-100 text-primary item-box size-16 bg-primary/10 rounded-full sm:mx-6 mx-2 shrink-0 flex items-center justify-center ${featureSelected === feature.name
                ? "bg-primary/20"
                : "bg-primary/10"}`}
            >
              {feature.svg}
            </span>
            <span
              className={`font-bold text-xl my-3 ${featureSelected === feature.name
                ? "text-primary"
                : "text-base-content/50"}`}
            >
              {feature.name}
            </span>
            <span className="justify-center mb-4 text-center">
              {feature.description}
            </span>
          </span>
        ))}
      </div>
      <div className="flex md:flex-row flex-col justify-center md:items-center gap-12 mx-auto">
        <div
          className="space-y-4 px-12 md:px-0 py-12 max-w-xl text-base-content/80 leading-relaxed animate-opacity"
          key={featureSelected}
        >
          <h3 className="font-semibold text-base-content text-lg">
            {features.find((f) => f.name === featureSelected)["description"]}
          </h3>
          {features.find((f) => f.name === featureSelected)["content"]}
        </div>
      </div>
    </section>
  );
}

export default FeaturesListicle;
