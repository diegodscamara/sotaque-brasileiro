"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiCombobox } from "@/components/ui/multi-combobox";

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
 * Required field indicator component
 * @returns {React.JSX.Element} A red asterisk for required fields
 */
const RequiredFieldIndicator = (): React.JSX.Element => (
    <span className="ml-1 text-red-500" aria-hidden="true">*</span>
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
    const tErrors = useTranslations("errors");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full"
        >
            {/* Personal Details */}
            <div className="mb-8">
                <h2 className="mb-2 font-semibold text-xl leading-8">{t("forms.personalDetails.title")}</h2>
                <p className="mb-6 font-normal text-gray-500 dark:text-gray-400 text-sm leading-none">{t("forms.personalDetails.subtitle")}</p>

                <div className="space-y-6">
                    {/* First Name and Last Name */}
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.personalDetails.firstNameLabel")}
                                <RequiredFieldIndicator />
                            </Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder={t("forms.personalDetails.firstNamePlaceholder")}
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="bg-white dark:bg-gray-800"
                                aria-invalid={errors.firstName ? "true" : undefined}
                                aria-errormessage={errors.firstName ? "firstName-error" : undefined}
                            />
                            {errors.firstName && (
                                <div id="firstName-error" role="alert" className="text-red-500 text-sm">
                                    {errors.firstName}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.personalDetails.lastNameLabel")}
                                <RequiredFieldIndicator />
                            </Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder={t("forms.personalDetails.lastNamePlaceholder")}
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="bg-white dark:bg-gray-800"
                                aria-invalid={errors.lastName ? "true" : undefined}
                                aria-errormessage={errors.lastName ? "lastName-error" : undefined}
                            />
                            {errors.lastName && (
                                <div id="lastName-error" role="alert" className="text-red-500 text-sm">
                                    {errors.lastName}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email and Timezone */}
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.personalDetails.emailLabel")}
                                <RequiredFieldIndicator />
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t("forms.personalDetails.emailPlaceholder")}
                                value={formData.email}
                                onChange={handleInputChange}
                                className="bg-white dark:bg-gray-800"
                                aria-invalid={errors.email ? "true" : undefined}
                                aria-errormessage={errors.email ? "email-error" : undefined}
                            />
                            {errors.email && (
                                <div id="email-error" role="alert" className="text-red-500 text-sm">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timezone" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.personalDetails.timezoneLabel")}
                                <RequiredFieldIndicator />
                            </Label>
                            <Select
                                value={formData.timeZone}
                                onValueChange={(value) => handleSelectChange("timeZone", value)}
                            >
                                <SelectTrigger
                                    id="timezone"
                                    className="bg-white dark:bg-gray-800"
                                    aria-invalid={errors.timeZone ? "true" : undefined}
                                    aria-errormessage={errors.timeZone ? "timezone-error" : undefined}
                                >
                                    <SelectValue placeholder={t("forms.personalDetails.timezonePlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {timezones.map((timezone) => (
                                        <SelectItem key={timezone.id} value={timezone.id}>
                                            {timezone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.timeZone && (
                                <div id="timezone-error" role="alert" className="text-red-500 text-sm">
                                    {errors.timeZone}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gender and Country */}
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        {/* Country */}
                        <div className="space-y-2">
                            <Label htmlFor="country" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.personalDetails.countryLabel")}
                                <RequiredFieldIndicator />
                            </Label>
                            <Select
                                value={formData.country}
                                onValueChange={(value) => handleSelectChange("country", value)}
                            >
                                <SelectTrigger
                                    id="country"
                                    className="bg-white dark:bg-gray-800"
                                    aria-invalid={errors.country ? "true" : undefined}
                                    aria-errormessage={errors.country ? "country-error" : undefined}
                                >
                                    <SelectValue placeholder={t("forms.personalDetails.countryPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.country && (
                                <div id="country-error" role="alert" className="text-red-500 text-sm">
                                    {errors.country}
                                </div>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <Label htmlFor="gender" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.personalDetails.genderLabel")}
                            </Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => handleSelectChange("gender", value)}
                            >
                                <SelectTrigger
                                    id="gender"
                                    className="bg-white dark:bg-gray-800"
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Learning Preferences */}
            <div className="mb-8">
                <h2 className="mb-2 font-semibold text-xl leading-8">{t("forms.learningPreferences.title")}</h2>
                <p className="mb-6 font-normal text-gray-500 dark:text-gray-400 text-sm leading-none">{t("forms.learningPreferences.subtitle")}</p>

                <div className="space-y-6">
                    {/* Portuguese Level and Native Language */}
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        {/* Portuguese Level */}
                        <div className="space-y-2">
                            <Label htmlFor="portugueseLevel" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.learningPreferences.portugueseLevelLabel")}
                                <RequiredFieldIndicator />
                            </Label>
                            <Select
                                value={formData.portugueseLevel}
                                onValueChange={(value) => handleSelectChange("portugueseLevel", value)}
                            >
                                <SelectTrigger
                                    id="portugueseLevel"
                                    className="bg-white dark:bg-gray-800"
                                    aria-invalid={errors.portugueseLevel ? "true" : undefined}
                                    aria-errormessage={errors.portugueseLevel ? "portugueseLevel-error" : undefined}
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
                            {errors.portugueseLevel && (
                                <div id="portugueseLevel-error" role="alert" className="text-red-500 text-sm">
                                    {errors.portugueseLevel}
                                </div>
                            )}
                        </div>

                        {/* Native Language */}
                        <div className="space-y-2">
                            <Label htmlFor="nativeLanguage" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.learningPreferences.nativeLanguageLabel")}
                                <RequiredFieldIndicator />
                            </Label>
                            <Select
                                value={formData.nativeLanguage}
                                onValueChange={(value) => handleSelectChange("nativeLanguage", value)}
                            >
                                <SelectTrigger
                                    id="nativeLanguage"
                                    className="bg-white dark:bg-gray-800"
                                    aria-invalid={errors.nativeLanguage ? "true" : undefined}
                                    aria-errormessage={errors.nativeLanguage ? "nativeLanguage-error" : undefined}
                                >
                                    <SelectValue placeholder={t("forms.learningPreferences.nativeLanguagePlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((language) => (
                                        <SelectItem key={language.id} value={language.id}>
                                            {language.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.nativeLanguage && (
                                <div id="nativeLanguage-error" role="alert" className="text-red-500 text-sm">
                                    {errors.nativeLanguage}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        {/* Learning Goals */}
                        <div className="space-y-2">
                            <Label htmlFor="learningGoals" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.learningPreferences.learningGoalsLabel")}
                            </Label>
                            <MultiCombobox
                                options={learningGoals}
                                values={formData.learningGoals}
                                onChange={(values) => handleMultiSelectChange("learningGoals", values)}
                                placeholder={t("forms.learningPreferences.learningGoalsPlaceholder")}
                            />
                            {errors.learningGoals && (
                                <div id="learningGoals-error" role="alert" className="text-red-500 text-sm">
                                    {errors.learningGoals}
                                </div>
                            )}
                        </div>

                        {/* Other Languages */}
                        <div className="space-y-2">
                            <Label htmlFor="otherLanguages" className="flex items-center font-medium text-sm leading-none">
                                {t("forms.learningPreferences.otherLanguagesLabel")}
                            </Label>
                            <MultiCombobox
                                options={languages}
                                values={formData.otherLanguages}
                                onChange={(values) => handleMultiSelectChange("otherLanguages", values)}
                                placeholder={t("forms.learningPreferences.otherLanguagesPlaceholder")}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
} 