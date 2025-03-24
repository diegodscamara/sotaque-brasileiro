"use server";

import { prisma } from "@/libs/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get the onboarding progress for a student
 */
export async function getOnboardingProgress(studentId: string) {
  try {
    const progress = await prisma.onboardingProgress.findUnique({
      where: { studentId }
    });
    
    return progress || { studentId, currentStep: 1, completedSteps: [] };
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    return { studentId, currentStep: 1, completedSteps: [] };
  }
}

/**
 * Update the onboarding progress for a student
 */
export async function updateOnboardingProgress(
  studentId: string, 
  { currentStep, completedSteps }: { currentStep: number, completedSteps: number[] }
) {
  try {
    const progress = await prisma.onboardingProgress.upsert({
      where: { studentId },
      update: { currentStep, completedSteps, lastUpdated: new Date() },
      create: { 
        studentId, 
        currentStep, 
        completedSteps,
        lastUpdated: new Date()
      }
    });

    revalidatePath("/onboarding/student");
    return progress;
  } catch (error) {
    console.error("Error updating onboarding progress:", error);
    throw error;
  }
}

/**
 * Complete a step in the onboarding process
 */
export async function completeStep(studentId: string, step: number) {
  try {
    const progress = await getOnboardingProgress(studentId);
    const completedSteps = Array.from(new Set([...progress.completedSteps, step]));
    const nextStep = step + 1;
    
    const updatedProgress = await updateOnboardingProgress(studentId, {
      currentStep: nextStep,
      completedSteps
    });

    revalidatePath("/onboarding/student");
    return updatedProgress;
  } catch (error) {
    console.error("Error completing step:", error);
    throw error;
  }
}

/**
 * Reset a step in the onboarding process
 */
export async function resetStep(studentId: string, step: number) {
  try {
    const progress = await getOnboardingProgress(studentId);
    const completedSteps = progress.completedSteps.filter((s: number) => s !== step);
    
    const updatedProgress = await updateOnboardingProgress(studentId, {
      currentStep: step,
      completedSteps
    });

    revalidatePath("/onboarding/student");
    return updatedProgress;
  } catch (error) {
    console.error("Error resetting step:", error);
    throw error;
  }
} 