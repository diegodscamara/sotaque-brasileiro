"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import { countries } from "@/data/countries";
import { portugueseLevels } from "@/data/portuguese-levels";
import { useLocale } from "next-intl";
import { CircleFlag } from "react-circle-flags";
import { CalendarDays, GraduationCap, Package2, Coins, MapPin, User } from "lucide-react";
import { format } from "date-fns";

/**
 * ProfileHeader component that displays user information
 * @component
 * @returns {React.JSX.Element} Profile header with user data
 */
export function ProfileHeader(): React.JSX.Element {
  const t = useTranslations("profile");
  const { profile } = useUser();
  const locale = useLocale() as "en" | "es" | "fr" | "pt";
  
  // Get country name and code
  const country = countries.find(c => c.code === profile?.country);
  const countryCode = country?.code?.toLowerCase();
  
  // Get Portuguese level name
  const level = portugueseLevels.find(l => l.id === profile?.portugueseLevel);
  const levelName = level?.name[locale] || t("preferences.portugueseLevelOptions.unknown");
  
  // Format user's full name
  const fullName = profile?.firstName && profile?.lastName 
    ? `${profile.firstName} ${profile.lastName}`
    : profile?.firstName || profile?.lastName || t("unknownUser");
  
  // Get initials for avatar fallback
  const initials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : profile?.firstName?.[0] || profile?.lastName?.[0] || "?";
    
  // Format member since date
  const memberSince = profile?.createdAt 
    ? format(new Date(profile.createdAt), "MMMM yyyy")
    : "";

  return (
    <Card className="shadow-sm border overflow-hidden">
      <CardContent className="p-0">
        <div className="gap-0 grid grid-cols-1 md:grid-cols-12">
          {/* Left column - Avatar and name */}
          <div className="flex flex-col justify-center items-center md:col-span-4 bg-muted/20 p-6 border-r border-border/50 text-center">
            <Avatar className="mb-4 border-4 border-primary/10 w-32 h-32">
              <AvatarImage src={profile?.avatarUrl || ""} alt={fullName} />
              <AvatarFallback className="font-semibold text-3xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 w-full">
              <h2 className="font-bold text-2xl">{fullName}</h2>
              
              {profile?.hasAccess && (
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 mx-auto border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                  {t("activeSubscription")}
                </Badge>
              )}
              
              {profile?.role && (
                <div className="flex justify-center items-center gap-1.5 mt-2 text-muted-foreground text-sm">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{profile.role}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - User details */}
          <div className="md:col-span-8 p-6">
            <h3 className="mb-4 font-semibold text-lg">{t("userDetails")}</h3>
            
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              {/* Country */}
              {countryCode && (
                <div className="flex items-center gap-2">
                  <div className="bg-muted/30 p-2 rounded-md">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("personal.country")}</p>
                    <div className="flex items-center gap-1.5">
                      <CircleFlag countryCode={countryCode} height="18" width="18" />
                      <p className="font-medium">{country?.name}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Member since */}
              {memberSince && (
                <div className="flex items-center gap-2">
                  <div className="bg-muted/30 p-2 rounded-md">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("memberSinceLabel")}</p>
                    <p className="font-medium">{memberSince}</p>
                  </div>
                </div>
              )}
              
              {/* Student-specific information */}
              {profile?.role === "student" && (
                <>
                  {/* Portuguese level */}
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/30 p-2 rounded-md">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t("level")}</p>
                      <p className="font-medium">{levelName}</p>
                    </div>
                  </div>
                  
                  {/* Credits */}
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/30 p-2 rounded-md">
                      <Coins className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t("credits.title")}</p>
                      <p className="font-medium">{profile.credits || 0}</p>
                    </div>
                  </div>
                  
                  {/* Package */}
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/30 p-2 rounded-md">
                      <Package2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t("package.title")}</p>
                      <p className="font-medium">{profile.packageName || t("package.none")}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 