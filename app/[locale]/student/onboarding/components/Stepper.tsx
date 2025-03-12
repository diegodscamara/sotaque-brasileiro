"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  isStepDisabled: (step: number) => boolean;
  isLoading?: boolean;
}

/**
 * Responsive Stepper component for navigating between onboarding steps
 * Uses shadcn stepper component for improved accessibility and design
 * 
 * @param currentStep - The current active step
 * @param totalSteps - The total number of steps
 * @param onStepChange - Callback function when a step is clicked
 * @param isStepCompleted - Function to determine if a step is completed
 * @param isStepDisabled - Function to determine if a step is disabled
 * @param isLoading - Whether the current step is in loading state
 * @returns A responsive stepper component with shadcn UI
 */
export default function OnboardingStepper({
  currentStep,
  totalSteps,
  onStepChange,
  isStepCompleted,
  isStepDisabled,
  isLoading = false
}: StepperProps): React.JSX.Element {
  const t = useTranslations("student.onboarding");

  // Generate array of step numbers with titles and descriptions
  const steps = Array.from({ length: totalSteps }, (_, i) => ({
    step: i + 1,
    title: t(`stepper.step${i + 1}`),
    description: "", // You can add descriptions if needed
  }));

  // Handle step change
  const handleStepChange = (value: number) => {
    if (!isStepDisabled(value)) {
      onStepChange(value);
    }
  };

  return (
    <div className="space-y-8 w-full text-center">
      <Stepper
        value={currentStep}
        defaultValue={currentStep}
        onValueChange={handleStepChange}
        className="w-full"
        aria-label={t("stepper.ariaLabel") || "Onboarding Steps"}
      >
        {steps.map(({ step, title, description }) => {
          const isDisabled = isStepDisabled(step);

          return (
            <StepperItem
              key={step}
              step={step}
              className={`relative flex-col! ${step === steps.length ? 'flex-none' : 'flex-1'}`}
              disabled={isDisabled}
              completed={isStepCompleted(step)}
              loading={step === currentStep && isLoading}
            >
              <StepperTrigger
                className="z-10 flex-col gap-3 rounded"
                aria-label={t("stepper.stepLabel", { step })}
              >
                <StepperIndicator />
                <div className="max-sm:hidden space-y-0.5 px-2">
                  <StepperTitle>{title}</StepperTitle>
                  {description && (
                    <StepperDescription className="max-sm:hidden">{description}</StepperDescription>
                  )}
                </div>
              </StepperTrigger>

              {step < steps.length && (
                <StepperSeparator className="group-data-[orientation=horizontal]/stepper:w-full group-data-[orientation=horizontal]/stepper:flex-none top-3 left-0 md:left-20 absolute -order-1 bg-gray-200 dark:bg-card m-0 -translate-y-1/2" />
              )}
            </StepperItem>
          );
        })}
      </Stepper>
    </div>
  );
} 