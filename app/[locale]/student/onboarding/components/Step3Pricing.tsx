"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { OnboardingFormData } from "../types";

// Import the Pricing component
import Pricing from "@/components/landing-page/Pricing";

/**
 * Props for the Step3Pricing component
 * @interface Step3PricingProps
 * @property {OnboardingFormData} formData - The current form data from the onboarding process
 */
interface Step3PricingProps {
  formData: OnboardingFormData;
}

/**
 * Step 3 of the onboarding process - Package Selection
 * This component displays pricing plans and handles the subscription process.
 * After successful payment, the user will be redirected to the success page
 * where their class will be scheduled and onboarding will be completed.
 * 
 * @param {Step3PricingProps} props - Component props
 * @returns {React.JSX.Element} The pricing selection component
 */
export default function Step3Pricing({ formData }: Step3PricingProps): React.JSX.Element {
  const t = useTranslations("student.onboarding");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {/* Step Title */}
      {/* <div className="mb-6">
        <h1 className="font-semibold text-2xl">{t("step3.title")}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("step3.subtitle")}</p>
      </div> */}

      {/* Pricing Component with success redirect */}
      <Pricing successUrl="/student/onboarding/success" />
    </motion.div>
  );
} 