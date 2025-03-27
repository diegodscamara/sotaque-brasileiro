/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";

// UI Components
import { Input } from "@/components/ui/input";
import TimeZoneSelectWithSearch from "@/components/forms/TimeZoneSelectWithSearch";
import CountryOptionsWithFlagAndSearch from "@/components/forms/CountryOptionsWithFlagAndSearch";
import FormField from "@/components/forms/FormField";
import FormSection from "@/app/[locale]/(onboarding)/onboarding/student/components/FormSection";
import SelectWithRightIndicator from "@/components/forms/SelectWithRightIndicator";
import SelectWithSearch from "@/components/forms/SelectWithSearch";
import MultiSelectWithPlaceholderAndClear from "@/components/forms/MultiSelectWithPlaceholderAndClear";

// Data
import { countries } from "@/data/countries";
import { genders } from "@/data/genders";
import { portugueseLevels } from "@/data/portuguese-levels";
import { languages } from "@/data/languages";
import { learningGoals } from "@/data/learning-goals";

// Types
import { UserGender } from "@/types/User";
import { PortugueseLevel, LearningGoal } from "@/types/student";
import { OnboardingFormData } from "../../types";

interface Step1PersonalInfoProps {
    formData: OnboardingFormData;
    errors: Record<string, string | undefined>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSelectChange: (name: string, value: string) => void;
    handleMultiSelectChange: (name: string, values: string[]) => void;
    setErrors?: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
}

/**
 * Step 1 of the onboarding process - Personal Information and Learning Preferences
 * 
 * @param {Step1PersonalInfoProps} props - Component props
 * @returns {React.JSX.Element} The personal information form
 */
const Step1PersonalInfo = ({
    formData,
    errors,
    handleInputChange,
    handleSelectChange,
    handleMultiSelectChange
}: Step1PersonalInfoProps): React.JSX.Element => {
    // Translations
    const t = useTranslations("student.onboarding.step1");
    const locale = useLocale() as "en" | "es" | "fr" | "pt";

    // Memoize the timezone initialization function
    const initializeTimezone = useCallback(() => {
        const supportedTimezones = Intl.supportedValuesOf("timeZone");

        // If there's already a valid timezone in formData, don't override it
        if (formData.timeZone && supportedTimezones.includes(formData.timeZone)) {
            return;
        }

        // Try to get the user's timezone
        try {
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (supportedTimezones.includes(userTimeZone)) {
                handleSelectChange("timeZone", userTimeZone);
                return;
            }
        } catch (e) {
            console.error("Failed to get user timezone:", e);
        }

        // Default to America/Toronto if nothing else works
        handleSelectChange("timeZone", "America/Toronto");
    }, [formData.timeZone, handleSelectChange]);

    // Initialize timezone only once when component mounts
    useEffect(() => {
        initializeTimezone();
    }, [initializeTimezone]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto w-full max-w-4xl"
        >
            {/* Personal Details */}
            <FormSection
                title={t("forms.personalDetails.title")}
                subtitle={t("forms.personalDetails.subtitle")}
            >
                {/* First Name and Last Name */}
                <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <FormField
                        label={t("forms.personalDetails.firstNameLabel")}
                        id="firstName"
                        error={errors.firstName}
                        required
                    >
                        <Input
                            id="firstName"
                            name="firstName"
                            placeholder={t("forms.personalDetails.firstNamePlaceholder")}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            aria-invalid={errors.firstName ? "true" : undefined}
                            aria-errormessage={errors.firstName ? "firstName-error" : undefined}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                        />
                    </FormField>

                    <FormField
                        label={t("forms.personalDetails.lastNameLabel")}
                        id="lastName"
                        error={errors.lastName}
                        required
                    >
                        <Input
                            id="lastName"
                            name="lastName"
                            placeholder={t("forms.personalDetails.lastNamePlaceholder")}
                            value={formData.lastName}
                            onChange={handleInputChange}
                            aria-invalid={errors.lastName ? "true" : undefined}
                            aria-errormessage={errors.lastName ? "lastName-error" : undefined}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                        />
                    </FormField>
                </div>

                {/* Email and Timezone */}
                <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <FormField
                        label={t("forms.personalDetails.emailLabel")}
                        id="email"
                        error={errors.email}
                        required
                    >
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t("forms.personalDetails.emailPlaceholder")}
                            value={formData.email}
                            onChange={handleInputChange}
                            aria-invalid={errors.email ? "true" : undefined}
                            aria-errormessage={errors.email ? "email-error" : undefined}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                        />
                    </FormField>

                    <FormField
                        label={t("forms.personalDetails.timezoneLabel")}
                        id="timezone"
                        error={errors.timeZone}
                        required
                        helpText={t("forms.personalDetails.timezoneHelp")}
                    >
                        <TimeZoneSelectWithSearch
                            value={formData.timeZone || ""}
                            onChange={(value) => handleSelectChange("timeZone", value)}
                            placeholder={t("forms.personalDetails.timezonePlaceholder")}
                        />
                    </FormField>
                </div>

                {/* Country and Gender */}
                <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <FormField
                        label={t("forms.personalDetails.countryLabel")}
                        id="country"
                        error={errors.country}
                    >
                        <CountryOptionsWithFlagAndSearch
                            value={(() => {
                                // If there's a country in formData and it exists in our countries list, use it
                                if (formData.country && countries.some(c => c.name === formData.country)) {
                                    return formData.country;
                                }
                                // Otherwise default to Canada
                                return "Canada";
                            })()}
                            options={countries.map((country) => ({
                                label: typeof country.name === 'string' ? country.name : country.name[locale as keyof typeof country.name],
                                value: country.code
                            }))}
                            onChange={(value) => handleSelectChange("country", value)}
                            placeholder={t("forms.personalDetails.countryPlaceholder")}
                        />
                    </FormField>

                    <FormField
                        id="gender"
                        label={t("forms.personalDetails.genderLabel")}
                        helpText={t("forms.personalDetails.genderHelp")}
                    >
                        <SelectWithRightIndicator
                            id="gender"
                            value={formData.gender}
                            options={genders.map((gender) => ({ label: typeof gender.name === 'string' ? gender.name : gender.name[locale as keyof typeof gender.name], value: gender.id }))}
                            onChange={(value) => handleSelectChange("gender", value as UserGender)}
                            placeholder={t("forms.personalDetails.genderPlaceholder")}
                        />
                    </FormField>
                </div>
            </FormSection>

            {/* Learning Preferences */}

            <FormSection
                title={t("forms.learningPreferences.title")}
                subtitle={t("forms.learningPreferences.subtitle")}
            >
                {/* Portuguese Level and Native Language */}
                <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <FormField
                        label={t("forms.learningPreferences.portugueseLevelLabel")}
                        id="portugueseLevel"
                        error={errors.portugueseLevel}
                        required
                        helpText={t("forms.learningPreferences.portugueseLevelHelp")}
                    >
                        <SelectWithRightIndicator
                            id="portugueseLevel"
                            value={formData.portugueseLevel}
                            options={portugueseLevels.map((level) => ({
                                label: typeof level.name === 'string' ? level.name : level.name[locale as keyof typeof level.name],
                                value: level.id
                            }))}
                            onChange={(value) => handleSelectChange("portugueseLevel", value as PortugueseLevel)}
                            placeholder={t("forms.learningPreferences.portugueseLevelPlaceholder")}
                        />
                    </FormField>

                    <FormField
                        label={t("forms.learningPreferences.nativeLanguageLabel")}
                        id="nativeLanguage"
                        error={errors.nativeLanguage}
                        required
                        helpText={t("forms.learningPreferences.nativeLanguageHelp")}
                    >
                        <SelectWithSearch
                            value={formData.nativeLanguage}
                            options={languages.map((lang) => ({
                                label: lang.name,
                                value: lang.id
                            }))}
                            onChange={(value) => handleSelectChange("nativeLanguage", value)}
                            placeholder={t("forms.learningPreferences.nativeLanguagePlaceholder")}
                            nonFoundMessage={t("forms.learningPreferences.nativeLanguageNonFoundMessage")}
                        />
                    </FormField>
                </div>

                {/* Learning Goals and Other Languages */}
                <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    {/* Learning Goals */}
                    <FormField
                        label={t("forms.learningPreferences.learningGoalsLabel")}
                        id="learningGoals"
                        error={errors.learningGoals}
                        helpText={t("forms.learningPreferences.learningGoalsHelp")}
                        required
                    >
                        <MultiSelectWithPlaceholderAndClear
                            options={learningGoals.map(goal => ({
                                value: goal.id,
                                label: typeof goal.name === 'string' ? goal.name : goal.name[locale as keyof typeof goal.name]
                            }))}
                            values={formData.learningGoals || []}
                            onChange={(values) => handleMultiSelectChange("learningGoals", values as LearningGoal[])}
                            placeholder={t("forms.learningPreferences.learningGoalsPlaceholder")}
                            ariaLabel={t("forms.learningPreferences.learningGoalsLabel")}
                        />
                    </FormField>

                    {/* Other Languages */}
                    <FormField
                        label={t("forms.learningPreferences.otherLanguagesLabel")}
                        id="otherLanguages"
                        helpText={t("forms.learningPreferences.otherLanguagesHelp")}
                    >
                        <MultiSelectWithPlaceholderAndClear
                            options={languages.map(lang => ({
                                value: lang.id,
                                label: lang.name
                            }))}
                            values={formData.otherLanguages}
                            onChange={(values) => handleMultiSelectChange("otherLanguages", values)}
                            placeholder={t("forms.learningPreferences.otherLanguagesPlaceholder")}
                            ariaLabel={t("forms.learningPreferences.otherLanguagesLabel")}
                        />
                    </FormField>
                </div>
            </FormSection>
        </motion.div>
    );
};

export default Step1PersonalInfo; 