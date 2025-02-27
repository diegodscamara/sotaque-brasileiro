"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Check, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/libs/utils";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  isStepDisabled: (step: number) => boolean;
}

/**
 * Stepper component for navigating between onboarding steps
 */
export default function Stepper({
  currentStep,
  totalSteps,
  onStepChange,
  isStepCompleted,
  isStepDisabled
}: StepperProps): React.JSX.Element {
  const t = useTranslations("student.onboarding");
  
  // Generate array of step numbers
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = isStepCompleted(step);
          const isDisabled = isStepDisabled(step);
          
          return (
            <React.Fragment key={step}>
              {/* Step button */}
              <button
                type="button"
                onClick={() => !isDisabled && onStepChange(step)}
                disabled={isDisabled}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isCompleted && !isActive && "border-primary bg-primary/20 text-primary",
                  !isActive && !isCompleted && !isDisabled && "border-gray-300 bg-background hover:border-primary/50",
                  isDisabled && "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
                )}
                aria-current={isActive ? "step" : undefined}
                aria-label={t("stepper.stepLabel", { step })}
              >
                {isCompleted ? (
                  <Check weight="bold" className="w-5 h-5" />
                ) : (
                  <span className="font-medium text-sm leading-5">{step}</span>
                )}
              </button>
              
              {/* Connector line between steps */}
              {step < totalSteps && (
                <div 
                  className={cn(
                    "h-[2px] flex-1 mx-2",
                    (isCompleted && isStepCompleted(step + 1)) || (isCompleted && currentStep === step + 1)
                      ? "bg-primary"
                      : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Step labels */}
      <div className="flex justify-between items-center mt-2 px-1">
        {steps.map((step) => (
          <div 
            key={`label-${step}`} 
            className={cn(
              "text-xs font-medium",
              step === currentStep ? "text-primary" : "text-gray-500"
            )}
          >
            {t(`stepper.step${step}`)}
          </div>
        ))}
      </div>
    </div>
  );
} 