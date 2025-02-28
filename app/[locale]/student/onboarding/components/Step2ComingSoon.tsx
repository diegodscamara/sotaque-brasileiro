"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Clock } from "@phosphor-icons/react";

/**
 * Step 2 of the onboarding process - Coming Soon placeholder
 */
export default function Step2ComingSoon(): React.JSX.Element {
  const t = useTranslations("student.onboarding");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      {/* Step Title */}
      <div className="mb-6">
        <div className="mb-1 font-medium text-emerald-600 text-sm">{t("step2.step")}</div>
        <h1 className="font-semibold text-2xl">{t("step2.title")}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("step2.subtitle")}</p>
      </div>

      {/* Coming Soon Content */}
      <div className="bg-white dark:bg-gray-800 mb-8 p-8 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex flex-col justify-center items-center py-12 text-center">
          <Clock className="mb-4 w-12 h-12 text-emerald-600" weight="duotone" />
          <h3 className="mb-4 font-semibold text-xl">{t("comingSoon.title")}</h3>
          <p className="max-w-md text-gray-600 dark:text-gray-300">
            {t("comingSoon.message")}
          </p>
        </div>
      </div>
    </motion.div>
  );
} 