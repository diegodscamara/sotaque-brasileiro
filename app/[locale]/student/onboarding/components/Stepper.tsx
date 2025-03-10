"use client";

import React, { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/libs/utils";
import { motion } from "framer-motion";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  isStepDisabled: (step: number) => boolean;
}

/**
 * Responsive Stepper component for navigating between onboarding steps
 * 
 * @param currentStep - The current active step
 * @param totalSteps - The total number of steps
 * @param onStepChange - Callback function when a step is clicked
 * @param isStepCompleted - Function to determine if a step is completed
 * @param isStepDisabled - Function to determine if a step is disabled
 * @returns A responsive stepper component with animations
 */
export default function Stepper({
  currentStep,
  totalSteps,
  onStepChange,
  isStepCompleted,
  isStepDisabled
}: StepperProps): React.JSX.Element {
  const t = useTranslations("student.onboarding");
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  // Generate array of step numbers
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  // Scroll to center the current step on mobile
  useEffect(() => {
    if (stepsContainerRef.current && window.innerWidth < 768) {
      const container = stepsContainerRef.current;
      const activeStepElement = container.querySelector(`[data-step="${currentStep}"]`);
      
      if (activeStepElement) {
        const containerWidth = container.offsetWidth;
        const stepPosition = (activeStepElement as HTMLElement).offsetLeft;
        const stepWidth = (activeStepElement as HTMLElement).offsetWidth;
        
        container.scrollTo({
          left: stepPosition - containerWidth / 2 + stepWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [currentStep]);

  // Animation variants
  const stepVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 }
    },
    completed: { 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const lineVariants = {
    incomplete: { 
      width: "100%", 
      backgroundColor: "var(--color-gray-300)",
      transition: { duration: 0.5 }
    },
    complete: { 
      width: "100%", 
      backgroundColor: "var(--color-green-700)",
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative mb-8 w-full max-w-full overflow-hidden">
      {/* Mobile indicator */}
      <div className="md:hidden mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm text-center">
        {t("stepper.progress", { current: currentStep, total: totalSteps })}
      </div>

      {/* Steps container - scrollable on mobile */}
      <div 
        ref={stepsContainerRef}
        className="flex items-baseline py-2 md:overflow-visible overflow-x-auto hide-scrollbar"
        role="tablist"
        aria-label={t("stepper.ariaLabel") || "Onboarding Steps"}
      >
        {steps.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = isStepCompleted(step);
          const isDisabled = isStepDisabled(step);
          const stepState = isActive ? "active" : isCompleted ? "completed" : "inactive";
          const stepId = `step-${step}`;
          const panelId = `step-panel-${step}`;

          return (
            <React.Fragment key={step}>
              {/* Step button */}
              <div className="flex flex-col flex-shrink-0 items-center">
                <motion.button
                  type="button"
                  onClick={() => !isDisabled && onStepChange(step)}
                  disabled={isDisabled}
                  data-step={step}
                  initial="inactive"
                  animate={stepState}
                  variants={stepVariants}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  className={cn(
                    "relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 font-normal text-sm leading-none",
                    isActive && "border-green-700 dark:border-green-500 bg-green-700/20 dark:bg-green-500/20 text-gray-800 dark:text-gray-200",
                    isCompleted && !isActive && "border-green-700 dark:border-green-500 bg-green-700/20 dark:bg-green-500/20 text-gray-800 dark:text-gray-200",
                    !isActive && !isCompleted && !isDisabled && "border-gray-300 dark:border-gray-500 bg-transparent text-gray-800 dark:text-gray-200",
                    isDisabled && "cursor-not-allowed border-gray-300 dark:border-gray-500 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200",
                  )}
                  id={stepId}
                  aria-controls={panelId}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={t("stepper.stepLabel", { step })}
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={isDisabled}
                >
                  {isCompleted ? (
                    <Check weight="bold" className="w-4 sm:w-5 h-4 sm:h-5" aria-hidden="true" />
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm leading-5">{step}</span>
                  )}
                </motion.button>

                {/* Step label - visible on larger screens */}
                <div
                  className={cn(
                    "hidden md:block text-xs font-medium mt-2 text-center truncate",
                    isActive ? "text-green-700 dark:text-green-500" : "text-gray-800 dark:text-gray-200"
                  )}
                >
                  {t(`stepper.step${step}`)}
                </div>
              </div>

              {/* Connector line between steps */}
              {step < totalSteps && (
                <motion.div
                  className="flex-1 h-[3px]"
                  initial="incomplete"
                  animate={(isCompleted && isStepCompleted(step + 1)) || (isCompleted && currentStep === step + 1) 
                    ? "complete" 
                    : "incomplete"
                  }
                  variants={lineVariants}
                  aria-hidden="true"
                  style={{
                    backgroundColor: (isCompleted && isStepCompleted(step + 1)) || (isCompleted && currentStep === step + 1)
                      ? "var(--color-green-700)"
                      : "var(--color-gray-300)"
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step labels for mobile - show only current step */}
      <div className="md:hidden mt-2 text-center">
        <div className="font-medium text-green-700 dark:text-green-500 text-sm">
          {t(`stepper.step${currentStep}`)}
        </div>
      </div>

      {/* Progress bar for mobile */}
      <div className="md:hidden bg-popover mt-2 rounded-full w-full h-1.5 overflow-hidden">
        <motion.div 
          className="bg-green-700 dark:bg-green-500 rounded-full h-1.5"
          initial={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
} 