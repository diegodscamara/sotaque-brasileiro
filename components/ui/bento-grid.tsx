import React from "react";
import { ReactNode } from "react";
import { cn } from "@/libs/utils";

type BentoGridProps = {
  children: ReactNode;
  className?: string;
};

type BentoCardProps = {
  name?: string;
  className?: string;
  background?: ReactNode;
  Icon?: React.ElementType;
  description?: string;
  children?: ReactNode;
};

const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4 container",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard: React.FC<BentoCardProps> = ({
  name,
  className,
  background,
  Icon,
  description,
  children,
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-gray-800 dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
  >
    <div>{background}</div>
    <div className="z-10 flex flex-col gap-1 p-6 transform-gpu transition-all group-hover:-translate-y-10 duration-300 pointer-events-none">
      {Icon && <Icon className="group-hover:scale-75 w-12 h-12 text-neutral-700 transform-gpu origin-left transition-all duration-300 ease-in-out" />}
      <h3 className="font-semibold text-neutral-700 text-xl dark:text-neutral-300">
        {name}
      </h3>
      <p className="max-w-lg text-neutral-400">{description}</p>
      {children}
    </div>
    <div className="group-hover:bg-gray-800/[.03] group-hover:dark:bg-neutral-800/10 absolute inset-0 transform-gpu transition-all duration-300 pointer-events-none" />
  </div>
);

export { BentoCard, BentoGrid };
