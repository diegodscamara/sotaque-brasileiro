"use client";

import type { JSX } from "react";
import { useState } from "react";

interface Tab {
  id: string;
  title: string;
  content: JSX.Element;
}

const PricingTabs = ({ tabs }: { tabs: Tab[] }) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  return (
    <section className="flex flex-col items-center gap-4 mx-auto space-y-4">
      {/* TAB HEADER */}
      <div role="tablist" className="items-center justify-center bg-base-100 w-fit tabs tabs-boxed">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            role="tab"
            className={`tab ${
              activeTab === tab.id ? "bg-accent" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </a>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="animate-opacity" key={activeTab}>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </section>
  );
};

export default PricingTabs;
