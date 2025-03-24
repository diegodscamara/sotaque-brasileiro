"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./user-context";
import { getOnboardingProgress, updateOnboardingProgress, completeStep, resetStep } from "@/app/actions/onboarding";

interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  lastUpdated?: Date;
}

interface OnboardingContextType {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  error: Error | null;
  completeCurrentStep: () => Promise<void>;
  resetCurrentStep: () => Promise<void>;
  goToStep: (step: number) => Promise<void>;
  isStepCompleted: (step: number) => boolean;
  isStepCurrent: (step: number) => boolean;
  refetchProgress: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = async () => {
    if (!profile?.id) return;

    try {
      setIsLoading(true);
      const data = await getOnboardingProgress(profile.id);
      setProgress(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch onboarding progress"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [profile?.id]);

  const completeCurrentStep = async () => {
    if (!profile?.id || !progress) return;

    try {
      const updatedProgress = await completeStep(profile.id, progress.currentStep);
      setProgress(updatedProgress);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to complete step"));
    }
  };

  const resetCurrentStep = async () => {
    if (!profile?.id || !progress) return;

    try {
      const updatedProgress = await resetStep(profile.id, progress.currentStep);
      setProgress(updatedProgress);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to reset step"));
    }
  };

  const goToStep = async (step: number) => {
    if (!profile?.id || !progress) return;

    try {
      const updatedProgress = await updateOnboardingProgress(profile.id, {
        currentStep: step,
        completedSteps: progress.completedSteps
      });
      setProgress(updatedProgress);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to navigate to step"));
    }
  };

  const isStepCompleted = (step: number): boolean => {
    return progress?.completedSteps.includes(step) || false;
  };

  const isStepCurrent = (step: number): boolean => {
    return progress?.currentStep === step;
  };

  const value = {
    progress,
    isLoading,
    error,
    completeCurrentStep,
    resetCurrentStep,
    goToStep,
    isStepCompleted,
    isStepCurrent,
    refetchProgress: fetchProgress
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
} 