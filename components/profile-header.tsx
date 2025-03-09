"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import { countries } from "@/data/countries";
import { portugueseLevels } from "@/data/portuguese-levels";
import { useLocale } from "next-intl";
import { CircleFlag } from "react-circle-flags";
import { Calendar, GraduationCap, Package, Coins, MapPin, CheckCircle } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useMemo } from "react";

// Screen reader only class
const srOnly = "absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0";

/**
 * ProfileHeader component displays user profile information in a structured card layout
 * 
 * Features:
 * - Displays user avatar, name, country, membership date, and role-specific information
 * - Fully responsive layout that adapts to different screen sizes
 * - Optimized with memoization to prevent unnecessary recalculations
 * - Enhanced accessibility with proper ARIA attributes and semantic HTML
 * - Handles missing data gracefully with appropriate fallbacks
 * 
 * @component
 * @returns {React.JSX.Element} Profile header card with user information
 */
export function ProfileHeader(): React.JSX.Element {
  const t = useTranslations("profile");
  const { profile } = useUser();
  const locale = useLocale() as "en" | "es" | "fr" | "pt";

  // Memoize derived data to prevent unnecessary recalculations on re-renders
  const {
    country,
    countryCode,
    levelName,
    fullName,
    initials,
    memberSince,
    hasProfileData
  } = useMemo(() => {
    // Handle case when profile data is not available
    if (!profile) {
      return {
        country: undefined,
        countryCode: undefined,
        levelName: t("preferences.portugueseLevelOptions.unknown"),
        fullName: t("unknownUser"),
        initials: "?",
        memberSince: "",
        hasProfileData: false
      };
    }

    // Get country name and code
    const country = countries.find(c => c.code === profile.country);
    const countryCode = country?.code?.toLowerCase();

    // Get Portuguese level name
    const level = portugueseLevels.find(l => l.id === profile.portugueseLevel);
    const levelName = level?.name[locale] || t("preferences.portugueseLevelOptions.unknown");

    // Format user's full name
    const fullName = profile.firstName && profile.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile.firstName || profile.lastName || t("unknownUser");

    // Get initials for avatar fallback
    const initials = profile.firstName && profile.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`
      : profile.firstName?.[0] || profile.lastName?.[0] || "?";

    // Format member since date
    const memberSince = profile.createdAt
      ? format(new Date(profile.createdAt), "MMMM yyyy")
      : "";

    return {
      country,
      countryCode,
      levelName,
      fullName,
      initials,
      memberSince,
      hasProfileData: true
    };
  }, [profile, locale, t]);

  if (!hasProfileData) {
    return (
      <Card className="shadow-sm border rounded-lg overflow-hidden animate-pulse">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-muted/50 rounded-lg w-16 h-16" />
            <div className="bg-muted/50 rounded w-32 h-6" />
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 mt-4 w-full">
              <div className="bg-muted/30 rounded h-12" />
              <div className="bg-muted/30 rounded h-12" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section aria-labelledby="profile-header-title">
      <h1 id="profile-header-title" className={srOnly}>{t("profileHeader")}</h1>

      <Card className="shadow-sm border rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="flex md:flex-row flex-col">
            {/* Left column - Avatar and name */}
            <div className="flex flex-col justify-center items-center gap-3 bg-muted/20 p-6 md:w-1/4">
              <Avatar
                className="border-4 border-primary/10 rounded-full w-16 h-16"
                aria-label={t("avatarAlt", { name: fullName })}
              >
                <AvatarImage
                  className="rounded-lg object-cover"
                  src={profile?.avatarUrl || ""}
                  alt=""
                  loading="lazy"
                />
                <AvatarFallback className="bg-primary/10 rounded-lg font-semibold text-primary text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="font-bold text-xl md:text-2xl" id="profile-name">{fullName}</h2>
              </div>
            </div>

            {/* Right column - User details */}
            <div
              className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-6 md:w-3/4"
              aria-labelledby="profile-name"
            >
              {/* Country */}
              {countryCode && (
                <div className="group flex items-center gap-4">
                  <div className="group-hover:bg-primary/10 bg-green-700/10 dark:bg-green-500/10 p-2 rounded-md transition-colors">
                    <MapPin
                      className="w-5 h-5 text-primary"
                      aria-hidden="true"
                      weight="duotone"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-xs">
                      {t("personal.country")}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <CircleFlag
                        countryCode={countryCode}
                        height="18"
                        width="18"
                        aria-hidden="true"
                      />
                      <p className="font-medium">{country?.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Member since */}
              {memberSince && (
                <div className="group flex items-center gap-4">
                  <div className="group-hover:bg-primary/10 bg-green-700/10 dark:bg-green-500/10 p-2 rounded-md transition-colors">
                    <Calendar
                      className="w-5 h-5 text-primary"
                      aria-hidden="true"
                      weight="duotone"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-xs">
                      {t("memberSinceLabel")}
                    </p>
                    <p className="font-medium">{memberSince}</p>
                  </div>
                </div>
              )}

              {/* Student-specific information */}
              {profile?.role === "student" && (
                <>
                  {/* Portuguese level */}
                  <div className="group flex items-center gap-4">
                    <div className="group-hover:bg-primary/10 bg-green-700/10 dark:bg-green-500/10 p-2 rounded-md transition-colors">
                      <GraduationCap
                        className="w-5 h-5 text-primary"
                        aria-hidden="true"
                        weight="duotone"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground text-xs">
                        {t("level")}
                      </p>
                      <p className="font-medium">{levelName}</p>
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="group flex items-center gap-4">
                    <div className="group-hover:bg-primary/10 bg-green-700/10 dark:bg-green-500/10 p-2 rounded-md transition-colors">
                      <Coins
                        className="w-5 h-5 text-primary"
                        aria-hidden="true"
                        weight="duotone"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground text-xs">
                        {t("credits.title")}
                      </p>
                      <p className="font-medium">{profile.credits || 0}</p>
                    </div>
                  </div>

                  {/* Package */}
                  <div className="group flex items-center gap-4">
                    <div className="group-hover:bg-primary/10 bg-green-700/10 dark:bg-green-500/10 p-2 rounded-md transition-colors">
                      <Package
                        className="w-5 h-5 text-primary"
                        aria-hidden="true"
                        weight="duotone"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground text-xs">
                        {t("package.title")}
                      </p>
                      <p className="font-medium">{profile.packageName || t("package.none")}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Subscription */}
              {profile?.hasAccess && (
                <div className="group flex items-center gap-4">
                  <div className="group-hover:bg-primary/10 bg-green-700/10 dark:bg-green-500/10 p-2 rounded-md transition-colors">
                    <CheckCircle
                      className="w-5 h-5 text-primary"
                      aria-hidden="true"
                      weight="duotone"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-xs">
                      {t("subscription.title")}
                    </p>
                    <p className="font-medium">{t("activeSubscription")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
} 