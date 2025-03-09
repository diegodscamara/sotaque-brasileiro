"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useState } from "react";
import { countries } from "@/data/countries";
import { genders } from "@/data/genders";
import { portugueseLevels } from "@/data/portuguese-levels";
import { languages } from "@/data/languages";
import React from "react";
import { CircleFlag } from "react-circle-flags";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/libs/utils";
import { User, GraduationCap, BookOpen } from "lucide-react";

// Define the form schema with Zod
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  country: z.string().min(1, { message: "Please select a country." }),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say", "non_binary"], {
    required_error: "Please select a gender.",
  }),
  portugueseLevel: z.enum(["beginner", "elementary", "intermediate", "upper_intermediate", "advanced", "proficient", "native", "unknown"], {
    required_error: "Please select your Portuguese level.",
  }),
  nativeLanguage: z.string().min(1, { message: "Please enter your native language." }),
  otherLanguages: z.string().optional(),
  learningGoals: z.string().optional(),
  timeZone: z.string().optional(),
  biography: z.string().optional(),
  specialties: z.string().optional(),
  languages: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);

  // Default form values from user context
  const defaultValues: Partial<ProfileFormValues> = {
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    gender: (profile?.gender as any) || "prefer_not_to_say",
    country: profile?.country || "",
    portugueseLevel: (profile?.portugueseLevel as any) || "unknown",
    nativeLanguage: profile?.nativeLanguage || "",
    otherLanguages: profile?.otherLanguages?.join(", ") || "",
    learningGoals: profile?.learningGoals?.join(", ") || "",
    timeZone: profile?.timeZone || "",
    biography: profile?.biography || "",
    specialties: profile?.specialties?.join(", ") || "",
    languages: profile?.languages?.join(", ") || "",
  };

  // Initialize the form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Handle form submission
  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSubmitting(true);

      // Update user data
      await updateUser(user?.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        gender: data.gender,
      });

      // Update role-specific data
      if (profile?.role === "student") {
        await updateStudent(profile.id as string, {
          portugueseLevel: data.portugueseLevel,
          nativeLanguage: data.nativeLanguage,
          otherLanguages: data.otherLanguages ? data.otherLanguages.split(",").map(lang => lang.trim()) : [],
          learningGoals: data.learningGoals ? data.learningGoals.split(",").map(goal => goal.trim()) : [],
          timeZone: data.timeZone,
        });
      } else if (profile?.role === "teacher") {
        await updateTeacher(profile.id as string, {
          biography: data.biography,
          specialties: data.specialties ? data.specialties.split(",").map(spec => spec.trim()) : [],
          languages: data.languages ? data.languages.split(",").map(lang => lang.trim()) : [],
        });
      }

      // Refresh user data
      await refetchUserData();

      // Show success toast
      toast({
        title: t("toast.success.title"),
        description: t("toast.success.description"),
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" aria-label="Profile form">
        <div className="flex md:flex-row flex-col gap-6">
          <div className="w-full md:w-64">
            <div className="top-6 sticky">
              <Tabs defaultValue="personal" orientation="vertical" className="w-full">
                <TabsList className="flex flex-row md:flex-col bg-muted/50 p-1 w-full h-auto">
                  <TabsTrigger 
                    value="personal" 
                    className="flex justify-start items-center gap-2 data-[state=active]:bg-background w-full"
                  >
                    <User className="w-4 h-4" />
                    <span>{t("tabs.personal")}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences" 
                    className="flex justify-start items-center gap-2 data-[state=active]:bg-background w-full"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{t("tabs.preferences")}</span>
                  </TabsTrigger>
                  {profile?.role === "teacher" && (
                    <TabsTrigger 
                      value="teacher" 
                      className="flex justify-start items-center gap-2 data-[state=active]:bg-background w-full"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{t("tabs.teacher")}</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
              
              <div className="hidden md:block mt-8">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t("buttons.saving") : t("buttons.saveChanges")}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <TabsContent value="personal" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t("personal.title")}</CardTitle>
                  <CardDescription>{t("personal.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("personal.firstName")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("personal.firstNamePlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("personal.lastName")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("personal.lastNamePlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("personal.email")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("personal.emailPlaceholder")} {...field} disabled />
                        </FormControl>
                        <FormDescription>{t("personal.emailDescription")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t("personal.country")}</FormLabel>
                          <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={countrySearchOpen}
                                  className="justify-between w-full"
                                >
                                  {field.value ? (
                                    <div className="flex items-center gap-2">
                                      {field.value && (
                                        <CircleFlag 
                                          countryCode={field.value.toLowerCase()} 
                                          height="16" 
                                          width="16" 
                                        />
                                      )}
                                      {countries.find((country) => country.code === field.value)?.name || t("personal.countryPlaceholder")}
                                    </div>
                                  ) : (
                                    t("personal.countryPlaceholder")
                                  )}
                                  <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-full">
                              <Command>
                                <CommandInput placeholder={t("personal.countrySearchPlaceholder")} />
                                <CommandEmpty>{t("personal.noCountriesFound")}</CommandEmpty>
                                <CommandGroup className="max-h-[300px] overflow-auto">
                                  {countries.map((country) => (
                                    <CommandItem
                                      key={country.code}
                                      value={country.code}
                                      onSelect={() => {
                                        form.setValue("country", country.code);
                                        setCountrySearchOpen(false);
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <CircleFlag countryCode={country.code.toLowerCase()} height="16" width="16" />
                                        {country.name}
                                      </div>
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field.value === country.code ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("personal.gender")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("personal.genderPlaceholder")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genders.map((gender) => (
                                <SelectItem key={gender.id} value={gender.id}>
                                  {gender.name[locale]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t("preferences.title")}</CardTitle>
                  <CardDescription>{t("preferences.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile?.role === "student" && (
                    <>
                      <FormField
                        control={form.control}
                        name="portugueseLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("preferences.portugueseLevel")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("preferences.portugueseLevelPlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {portugueseLevels.map((level) => (
                                  <SelectItem key={level.id} value={level.id}>
                                    {level.name[locale]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nativeLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("preferences.nativeLanguage")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("preferences.nativeLanguagePlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px]">
                                {languages.map((language) => (
                                  <SelectItem key={language.id} value={language.id}>
                                    {language.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>{t("preferences.nativeLanguageDescription")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="otherLanguages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("preferences.otherLanguages")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("preferences.otherLanguagesPlaceholder")} {...field} />
                            </FormControl>
                            <FormDescription>{t("preferences.otherLanguagesDescription")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="learningGoals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("preferences.learningGoals")}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={t("preferences.learningGoalsPlaceholder")} 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>{t("preferences.learningGoalsDescription")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="timeZone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("preferences.timeZone")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("preferences.timeZonePlaceholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {profile?.role === "teacher" && (
              <TabsContent value="teacher" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("teacher.title")}</CardTitle>
                    <CardDescription>{t("teacher.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="biography"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("teacher.biography")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t("teacher.biographyPlaceholder")} 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>{t("teacher.biographyDescription")}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specialties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("teacher.specialties")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("teacher.specialtiesPlaceholder")} {...field} />
                          </FormControl>
                          <FormDescription>{t("teacher.specialtiesDescription")}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="languages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("teacher.languages")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("teacher.languagesPlaceholder")} {...field} />
                          </FormControl>
                          <FormDescription>{t("teacher.languagesDescription")}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </div>
        </div>
        
        <div className="md:hidden">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("buttons.saving") : t("buttons.saveChanges")}
          </Button>
        </div>
      </form>
    </Form>
  );
} 