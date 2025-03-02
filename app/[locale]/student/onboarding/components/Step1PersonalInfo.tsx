/* eslint-disable no-unused-vars */
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "@phosphor-icons/react";

// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Data
import { countries } from "@/data/countries";
import { genders } from "@/data/genders";
import { timezones } from "@/data/timezones";
import { portugueseLevels } from "@/data/portuguese-levels";
import { languages } from "@/data/languages";
import { learningGoals } from "@/data/learning-goals";

// Types
import { OnboardingFormData } from "@/app/[locale]/student/onboarding/types";

/**
 * Required field indicator component with tooltip
 * 
 * @returns {React.JSX.Element} A red asterisk for required fields with tooltip
 */
const RequiredFieldIndicator = (): React.JSX.Element => {
    const t = useTranslations("student.onboarding.step1");

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <span className="inline-flex ml-1 text-red-500" aria-hidden="true">*</span>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{t("forms.requiredField")}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

/**
 * Field help tooltip component
 * 
 * @param {string} content - The tooltip content
 * @returns {React.JSX.Element} An info icon with tooltip
 */
const FieldHelp = ({ content }: { content: string }): React.JSX.Element => (
    <TooltipProvider>
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center ml-1.5 text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-400 transition-colors">
                    <Info size={14} weight="fill" aria-hidden="true" />
                </span>
            </TooltipTrigger>
            <TooltipContent className="bg-green-600 dark:bg-green-500 text-gray-200 dark:text-gray-800">
                <p className="text-xs">{content}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

/**
 * Form section component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Section content
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section subtitle
 * @returns {React.JSX.Element} A styled form section
 */
const FormSection = ({
    children,
    title,
    subtitle
}: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}): React.JSX.Element => (
    <motion.div
        className="mb-10 last:mb-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
    >
        <div className="mb-6">
            <h2 className="mb-2 font-semibold text-gray-900 dark:text-gray-50 text-xl leading-tight">{title}</h2>
            <p className="font-normal text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{subtitle}</p>
        </div>

        <div className="space-y-6">
            {children}
        </div>
    </motion.div>
);

/**
 * Form field component with error handling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Field content
 * @param {string} props.label - Field label
 * @param {string} props.id - Field ID
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.helpText - Optional help text
 * @returns {React.JSX.Element} A styled form field with label and error handling
 */
const FormField = ({
    children,
    label,
    id,
    error,
    required = false,
    helpText
}: {
    children: React.ReactNode;
    label: string;
    id: string;
    error?: string;
    required?: boolean;
    helpText?: string;
}): React.JSX.Element => (
    <div className="space-y-2">
        <div className="flex items-center">
            <Label
                htmlFor={id}
                className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm leading-none"
            >
                {label}
                {required && <RequiredFieldIndicator />}
                {helpText && <FieldHelp content={helpText} />}
            </Label>
        </div>
        {children}
        <AnimatePresence>
            {error && (
                <div
                    id={`${id}-error`}
                    role="alert"
                    className="font-medium text-red-500 text-xs"
                >
                    {error}
                </div>
            )}
        </AnimatePresence>
    </div>
);

interface Step1Props {
    formData: OnboardingFormData;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string, value: string) => void;
    handleMultiSelectChange: (name: string, values: string[]) => void;
}

/**
 * Step 1 of the onboarding process - Personal Information and Learning Preferences
 * 
 * @param {Step1Props} props - Component props
 * @returns {React.JSX.Element} The personal information form
 */
export default function Step1PersonalInfo({
    formData,
    errors,
    handleInputChange,
    handleSelectChange,
    handleMultiSelectChange
}: Step1Props): React.JSX.Element {
    // Translations
    const t = useTranslations("student.onboarding.step1");

    // Track which sections have been interacted with for progressive disclosure
    const [activeSections, setActiveSections] = useState<{
        personal: boolean;
        learning: boolean;
    }>({
        personal: true,
        learning: false
    });

    // Activate learning section when personal section is filled
    React.useEffect(() => {
        if (formData.firstName && formData.lastName && formData.email && !activeSections.learning) {
            setActiveSections(prev => ({ ...prev, learning: true }));
        }
    }, [formData.firstName, formData.lastName, formData.email, activeSections.learning]);

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
                        <Select
                            value={formData.timeZone}
                            onValueChange={(value) => handleSelectChange("timeZone", value)}
                        >
                            <SelectTrigger
                                id="timezone"
                                aria-invalid={errors.timeZone ? "true" : undefined}
                                aria-errormessage={errors.timeZone ? "timezone-error" : undefined}
                                className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                            >
                                <SelectValue placeholder={t("forms.personalDetails.timezonePlaceholder")} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {timezones.map((timezone) => (
                                    <SelectItem key={timezone.id} value={timezone.id}>
                                        {timezone.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                {/* Country and Gender */}
                <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    <FormField
                        label={t("forms.personalDetails.countryLabel")}
                        id="country"
                        error={errors.country}
                    >
                        <Select
                            value={formData.country}
                            onValueChange={(value) => handleSelectChange("country", value)}
                        >
                            <SelectTrigger
                                id="country"
                                aria-invalid={errors.country ? "true" : undefined}
                                aria-errormessage={errors.country ? "country-error" : undefined}
                                className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                            >
                                <SelectValue placeholder={t("forms.personalDetails.countryPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {countries.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                        {country.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label={t("forms.personalDetails.genderLabel")}
                        id="gender"
                        helpText={t("forms.personalDetails.genderHelp")}
                    >
                        <Select
                            value={formData.gender}
                            onValueChange={(value) => handleSelectChange("gender", value)}
                        >
                            <SelectTrigger
                                id="gender"
                                className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                            >
                                <SelectValue placeholder={t("forms.personalDetails.genderPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {genders.map((gender) => (
                                    <SelectItem key={gender.id} value={gender.id}>
                                        {gender.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
            </FormSection>

            {/* Learning Preferences */}
            <AnimatePresence>
                {activeSections.learning && (
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
                                <Select
                                    value={formData.portugueseLevel}
                                    onValueChange={(value) => handleSelectChange("portugueseLevel", value)}
                                >
                                    <SelectTrigger
                                        id="portugueseLevel"
                                        aria-invalid={errors.portugueseLevel ? "true" : undefined}
                                        aria-errormessage={errors.portugueseLevel ? "portugueseLevel-error" : undefined}
                                        className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                                    >
                                        <SelectValue placeholder={t("forms.learningPreferences.portugueseLevelPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {portugueseLevels.map((level) => (
                                            <SelectItem key={level.id} value={level.id}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField
                                label={t("forms.learningPreferences.nativeLanguageLabel")}
                                id="nativeLanguage"
                                error={errors.nativeLanguage}
                                required
                            >
                                <Select
                                    value={formData.nativeLanguage}
                                    onValueChange={(value) => handleSelectChange("nativeLanguage", value)}
                                >
                                    <SelectTrigger
                                        id="nativeLanguage"
                                        aria-invalid={errors.nativeLanguage ? "true" : undefined}
                                        aria-errormessage={errors.nativeLanguage ? "nativeLanguage-error" : undefined}
                                        className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                                    >
                                        <SelectValue placeholder={t("forms.learningPreferences.nativeLanguagePlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {languages.map((language) => (
                                            <SelectItem key={language.id} value={language.id}>
                                                {language.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>

                        {/* Learning Goals */}
                        <FormField
                            label={t("forms.learningPreferences.learningGoalsLabel")}
                            id="learningGoals"
                            error={errors.learningGoals}
                            helpText={t("forms.learningPreferences.learningGoalsHelp")}
                        >
                            <MultiCombobox
                                options={learningGoals}
                                values={formData.learningGoals}
                                onChange={(values) => handleMultiSelectChange("learningGoals", values)}
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
                            <MultiCombobox
                                options={languages}
                                values={formData.otherLanguages}
                                onChange={(values) => handleMultiSelectChange("otherLanguages", values)}
                                placeholder={t("forms.learningPreferences.otherLanguagesPlaceholder")}
                                ariaLabel={t("forms.learningPreferences.otherLanguagesLabel")}
                            />
                        </FormField>
                    </FormSection>
                )}
            </AnimatePresence>
        </motion.div>
    );
} 