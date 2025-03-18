"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Info, GraduationCap, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useUser } from "@/contexts/user-context";
import { updateUser } from "@/app/actions/users";
import { updateStudent } from "@/app/actions/students";
import { updateTeacher } from "@/app/actions/teachers";
import { useState, useMemo, useEffect } from "react";
import { countries } from "@/data/countries";
import { genders } from "@/data/genders";
import { portugueseLevels } from "@/data/portuguese-levels";
import { languages } from "@/data/languages";
import React from "react";
import { cn } from "@/libs/utils";
import { Combobox } from "@/components/ui/combobox";
import { LanguageCombobox } from "./ui/language-combobox";
import { MultiLanguageCombobox } from "./ui/multi-language-combobox";
import { MultiGoalsCombobox } from "./ui/multi-goals-combobox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import TimeZoneSelectWithSearch from "@/components/forms/TimeZoneSelectWithSearch";

// Define the form schema with Zod
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  country: z.string().min(1, { message: "Please select a country." }),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say", "non_binary"]).optional(),
  portugueseLevel: z.enum(["beginner", "elementary", "intermediate", "upper_intermediate", "advanced", "proficient", "native", "unknown"], {
    required_error: "Please select your Portuguese level.",
  }),
  nativeLanguage: z.string().min(1, { message: "Please select your native language." }),
  otherLanguages: z.array(z.string()).default([]),
  learningGoals: z.array(z.string()).default([]),
  timeZone: z.string().min(1, { message: "Please select your time zone." }),
  biography: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * Required field indicator component with tooltip
 * 
 * @returns {React.JSX.Element} A red asterisk for required fields with tooltip
 */
const RequiredFieldIndicator = (): React.JSX.Element => {
  const t = useTranslations("profile");

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex ml-1 text-red-500" aria-hidden="true">*</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{t("requiredField")}</p>
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
          <Info size={14} className="w-4 h-4" aria-hidden="true" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="bg-green-600 dark:bg-green-500 text-gray-200 dark:text-gray-800">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/**
 * Custom hook for timezone detection
 * 
 * @param {any} form - The form instance
 * @param {Object} profile - The user profile
 * @param {Function} t - The translation function
 * @returns {Object} The timezone detection state
 */
const useTimezoneDetection = (form: any, profile: any, t: any) => {
  return { isDetecting: false, error: null };
};

/**
 * Custom hook for form submission
 * 
 * @param {Object} options - Hook options
 * @param {Function} options.updateProfile - Function to update the profile
 * @param {Function} options.refetchUserData - Function to refresh user data
 * @param {Function} options.t - Translation function
 * @param {Function} options.toast - Toast function
 * @returns {Object} Form submission state and handler
 */
const useProfileSubmission = ({
  updateProfile,
  refetchUserData,
  t,
  toast
}: {
  updateProfile: (values: z.infer<typeof profileFormSchema>) => Promise<any>;
  refetchUserData?: () => Promise<void>;
  t: any;
  toast: any;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await updateProfile(values);

      if (result.error) {
        setSubmitError(result.error);
        toast({
          title: t("updateError"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("updateSuccess"),
          description: t("updateSuccessDescription"),
        });

        // Refresh user data if needed
        if (refetchUserData) {
          await refetchUserData();
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : t("unknownError")
      );
      toast({
        title: t("updateError"),
        description: error instanceof Error
          ? error.message
          : t("unknownError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitError, handleSubmit };
};

/**
 * Custom FormSelect component that correctly implements the Select component with FormControl
 */
const FormSelect = React.forwardRef<
  HTMLButtonElement,
  {
    options: { id: string; name: string | Record<string, string> }[];
    placeholder: string;
    onChange?: (value: string) => void;
    value?: string;
    disabled?: boolean;
    locale?: string;
    className?: string;
    isLoading?: boolean;
    loadingText?: string;
  }
>(({ options, placeholder, onChange, value, disabled, locale = 'en', className, isLoading, loadingText }, ref) => {
  return (
    <SelectTrigger ref={ref} className={cn("focus:ring-2 focus:ring-primary/20 w-full transition-shadow", className)}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        <SelectValue placeholder={placeholder} />
      )}
    </SelectTrigger>
  );
});
FormSelect.displayName = "FormSelect";

/**
 * ProfileForm component for editing user profile information
 * Uses the UserContext to avoid redundant data fetching
 * @component
 * @returns {React.JSX.Element} Profile form with user data
 */
export function ProfileForm(): React.JSX.Element {
  const { toast } = useToast();
  const t = useTranslations("profile");
  const locale = useLocale() as "en" | "es" | "fr" | "pt";
  const { profile, user, refetchUserData } = useUser();

  // Initialize the form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || user?.email || "",
      gender: (profile?.gender as any) || "prefer_not_to_say",
      country: profile?.country || "",
      timeZone: profile?.timeZone || "",
      portugueseLevel: (profile?.portugueseLevel as any) || "unknown",
      nativeLanguage: profile?.nativeLanguage || "",
      otherLanguages: Array.isArray(profile?.otherLanguages)
        ? profile.otherLanguages
        : [],
      learningGoals: Array.isArray(profile?.learningGoals)
        ? profile.learningGoals
        : [],
      biography: profile?.biography || "",
      specialties: Array.isArray(profile?.specialties)
        ? profile.specialties
        : [],
      languages: Array.isArray(profile?.languages)
        ? profile.languages
        : [],
    },
    mode: "onChange",
  });

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || user?.email || "",
        gender: (profile.gender as any) || "prefer_not_to_say",
        country: profile.country || "",
        timeZone: profile.timeZone || "",
        portugueseLevel: (profile.portugueseLevel as any) || "unknown",
        nativeLanguage: profile.nativeLanguage || "",
        otherLanguages: Array.isArray(profile.otherLanguages)
          ? profile.otherLanguages
          : [],
        learningGoals: Array.isArray(profile.learningGoals)
          ? profile.learningGoals
          : [],
        biography: profile.biography || "",
        specialties: Array.isArray(profile.specialties)
          ? profile.specialties
          : [],
        languages: Array.isArray(profile.languages)
          ? profile.languages
          : [],
      });
    }
  }, [profile, user?.email, form]);

  // State for timezone detection
  const { isDetecting: isDetectingTimezone, error: timezoneError } = useTimezoneDetection(form, profile, t);

  // Ensure the form is updated when the profile changes
  useEffect(() => {
    if (profile?.timeZone) {
      form.setValue("timeZone", profile.timeZone);
    }
  }, [profile?.timeZone, form]);

  // Format data for combobox components
  const formattedLanguages = useMemo(() => languages.map(lang => ({
    id: lang.id,
    name: lang.name
  })), []);

  // Function to update profile
  const updateProfile = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      // Update user data
      await updateUser(user?.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        country: values.country,
        gender: values.gender,
      });

      // Update student or teacher data
      if (profile?.role === "student") {
        await updateStudent(profile.id as string, {
          portugueseLevel: values.portugueseLevel,
          nativeLanguage: values.nativeLanguage,
          otherLanguages: values.otherLanguages,
          learningGoals: values.learningGoals,
          timeZone: values.timeZone,
        });
      } else if (profile?.role === "teacher") {
        await updateTeacher(profile.id as string, {
          biography: values.biography,
          specialties: values.specialties,
          languages: values.languages,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Error in updateProfile:", error);
      return {
        error: error instanceof Error
          ? error.message
          : "An unknown error occurred"
      };
    }
  };

  // Form submission handler
  const { isSubmitting, submitError, handleSubmit } = useProfileSubmission({
    updateProfile,
    refetchUserData,
    t,
    toast,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => handleSubmit(values))} className="space-y-4" aria-label="Profile form">
        <Tabs defaultValue="personal" className="flex flex-col gap-4 w-full">
          {/* Tabs navigation at the top */}
          <TabsList className="flex justify-start gap-2 w-fit">
            <TabsTrigger
              value="personal"
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{t("tabs.personal")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t("tabs.preferences")}</span>
            </TabsTrigger>
            {profile?.role === "teacher" && (
              <TabsTrigger
                value="biography"
                className="flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t("tabs.biography")}</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab content */}
          <TabsContent value="personal" className="mt-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>{t("personal.title")}</CardTitle>
                <CardDescription>{t("personal.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("personal.firstName")}
                          <RequiredFieldIndicator />
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("personal.firstNamePlaceholder")}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("personal.lastName")}
                          <RequiredFieldIndicator />
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("personal.lastNamePlaceholder")}
                            {...field}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("personal.email")}
                          <RequiredFieldIndicator />
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("personal.emailPlaceholder")}
                            {...field}
                            disabled
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("personal.gender")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isDetectingTimezone}
                        >
                          <FormControl>
                            <FormSelect
                              options={genders}
                              placeholder={t("personal.genderPlaceholder")}
                              locale={locale}
                              className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                            />
                          </FormControl>
                          <SelectContent>
                            {genders.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {typeof option.name === 'string' ? option.name : option.name[locale]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("personal.country")}
                          <RequiredFieldIndicator />
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={countries}
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            placeholder={t("personal.countryPlaceholder")}
                            ariaLabel={t("personal.country")}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                            showFlags={true}
                            useNameAsValue={false}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>{t("preferences.title")}</CardTitle>
                <CardDescription>{t("preferences.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("preferences.timeZone")}
                          <RequiredFieldIndicator />
                          <FieldHelp content={t("preferences.timeZoneHelp")} />
                        </FormLabel>
                        <TimeZoneSelectWithSearch
                          value={field.value || ""}
                          onChange={(value) => field.onChange(value)}
                          placeholder={t("forms.personalDetails.timezonePlaceholder")}
                        />
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portugueseLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("preferences.portugueseLevel")}
                          <RequiredFieldIndicator />
                          <FieldHelp content={t("preferences.portugueseLevelHelp")} />
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <FormSelect
                              options={portugueseLevels}
                              placeholder={t("preferences.portugueseLevelPlaceholder")}
                              locale={locale}
                              className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                            />
                          </FormControl>
                          <SelectContent>
                            {portugueseLevels.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {typeof option.name === 'string' ? option.name : option.name[locale]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nativeLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("preferences.nativeLanguage")}
                          <RequiredFieldIndicator />
                        </FormLabel>
                        <FormControl>
                          <LanguageCombobox
                            languages={formattedLanguages}
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            placeholder={t("preferences.nativeLanguagePlaceholder")}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherLanguages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("preferences.otherLanguages")}
                          <FieldHelp content={t("preferences.otherLanguagesHelp")} />
                        </FormLabel>
                        <div className="relative">
                          <MultiLanguageCombobox
                            languages={languages}
                            values={field.value}
                            onChange={(values) => field.onChange(values)}
                            placeholder={t("preferences.otherLanguagesPlaceholder")}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                          />
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="learningGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {t("preferences.learningGoals")}
                          <FieldHelp content={t("preferences.learningGoalsHelp")} />
                        </FormLabel>
                        <div className="relative">
                          <MultiGoalsCombobox
                            values={field.value}
                            onChange={(values) => field.onChange(values)}
                            placeholder={t("preferences.learningGoalsPlaceholder")}
                            className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                          />
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {profile?.role === "teacher" && (
            <TabsContent value="biography" className="mt-0 p-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t("teacher.biography.title")}</CardTitle>
                  <CardDescription>{t("teacher.biography.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="biography"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {t("teacher.biography.biography")}
                            <RequiredFieldIndicator />
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("teacher.biography.biographyPlaceholder")}
                              className="focus:ring-2 focus:ring-primary/20 w-full min-h-[200px] transition-shadow"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {t("teacher.biography.specialties")}
                          </FormLabel>
                          <div className="relative">
                            <MultiLanguageCombobox
                              languages={languages}
                              values={field.value}
                              onChange={(values) => field.onChange(values)}
                              placeholder={t("teacher.specialtiesPlaceholder")}
                              className="focus:ring-2 focus:ring-primary/20 w-full transition-shadow"
                            />
                          </div>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Save button below the form */}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
            className="focus:ring-2 focus:ring-primary/20 transition-shadow"
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="focus:ring-2 focus:ring-primary/20 transition-shadow"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("buttons.saving")}</span>
              </div>
            ) : (
              t("buttons.save")
            )}
          </Button>
        </div>

        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 mt-4 p-3 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
            <p className="font-medium">{t("error.title")}</p>
            <p>{submitError}</p>
          </div>
        )}
      </form>
    </Form>
  );
}