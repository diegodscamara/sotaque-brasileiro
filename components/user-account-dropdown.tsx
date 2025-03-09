"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CreditCard, 
  LogOut, 
  UserCircle, 
  Bell, 
  Sparkles,
  ChevronsUpDown,
  LayoutDashboard,
  BookOpen,
  Settings
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { JSX, useMemo } from "react";

import apiClient from "@/libs/api";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/actions/auth";
import config from "@/config";
import { cn } from "@/libs/utils";
import { useLocale } from "next-intl";
import Link from "next/link";
import messages from "@/messages/en.json";
import { useUser } from "@/contexts/user-context";

interface UserAccountDropdownProps {
  variant?: 'sidebar' | 'header';
}

/**
 * UserAccountDropdown component provides user account actions dropdown
 * with variants for sidebar and header
 * @component
 * @param {Object} props - Component props
 * @param {('sidebar'|'header')} [props.variant='header'] - Display variant
 * @returns {JSX.Element} Account dropdown with profile, billing, and sign-out options
 */
export function UserAccountDropdown({ 
  variant = 'header' 
}: UserAccountDropdownProps): JSX.Element {
  const router = useRouter();
  const t = useTranslations('shared.nav-user');
  const locale = useLocale();
  const { isMobile } = useSidebar();
  const { user, profile, hasAccess, isLoading } = useUser();

  const handleBilling = async () => {
    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-portal",
        {
          returnUrl: window.location.href,
        }
      );

      router.push(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Force a page reload to clear any cached state
    window.location.href = '/';
  };

  const handleUpgrade = async () => {
    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          priceId: profile?.packageName === "Explorer" || profile?.packageName === "Enthusiast"
            ? config.stripe.plans.find(plan => plan.name === "Master" && plan.interval === "monthly")?.priceId
            : config.stripe.plans.find(plan => plan.name === "Enthusiast" && plan.interval === "monthly")?.priceId,
          successUrl: window.location.href + "/dashboard",
          cancelUrl: window.location.href,
          mode: "subscription",
        }
      );

      router.push(url);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Determines the next higher plan based on the user's current plan
   * @returns {string | null} The name of the next higher plan or null if user has the highest plan
   */
  const getNextHigherPlan = useMemo(() => {
    if (!profile?.packageName) return "Enthusiast"; // Default to Enthusiast if no plan

    // Get all plans from the messages file
    const plans = messages.landing.pricing.plans;
    
    // Create an ordered array of plan tiers
    const planTiers = plans.map(plan => plan.tier);
    
    // Find the index of the current plan
    const currentPlanIndex = planTiers.findIndex(
      tier => tier === profile.packageName
    );
    
    // If the user has the highest plan or plan not found, return null
    if (currentPlanIndex === -1 || currentPlanIndex === planTiers.length - 1) {
      return null;
    }
    
    // Return the next plan in the array
    return planTiers[currentPlanIndex + 1];
  }, [profile?.packageName]);

  const handleUpgradePlan = async () => {
    try {
      if (!getNextHigherPlan) return;
      
      // Find the plan details
      const nextPlan = messages.landing.pricing.plans.find(
        plan => plan.tier === getNextHigherPlan
      );
      
      if (!nextPlan) return;
      
      // Get the monthly variant price ID
      const monthlyVariant = nextPlan.variants.find(
        variant => variant.interval === "monthly"
      );
      
      if (!monthlyVariant) return;
      
      const priceId = monthlyVariant.priceId.production;
      
      // Create checkout session
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          priceId,
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: window.location.href,
          mode: "subscription",
          clientReferenceId: profile?.userId || profile?.id
        }
      );

      router.push(url);
    } catch (e) {
      console.error("Error creating checkout session:", e);
    }
  };

  // Enhanced avatar fallback with initials
  const avatarFallback = useMemo(() => {
    if (profile?.firstName) {
      if (profile.lastName) {
        // First letter of first name + first letter of last name
        return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
      }
      // Just first letter of first name if no last name
      return profile.firstName.charAt(0).toUpperCase();
    }
    // First letter of email if no name
    return profile?.email?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "";
  }, [profile?.firstName, profile?.lastName, profile?.email, user?.email]);

  if (isLoading) {
    return (
      <div className="bg-gray-200 dark:bg-gray-600 rounded-full w-8 h-8 animate-pulse" 
           aria-label={t('loading')} />
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className={cn(
              "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
              "transition-colors hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Avatar className="rounded-lg w-8 h-8">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.firstName} />
              <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1 grid text-sm text-left leading-tight sidebar-expanded-only">
              <span className="font-semibold truncate">{profile?.firstName || t('loading')}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 sidebar-expanded-only" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-white dark:bg-gray-700 rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
              <Avatar className="rounded-lg w-8 h-8">
                <AvatarImage src={profile?.avatarUrl} alt={profile?.firstName} />
                <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="flex-1 grid text-sm text-left leading-tight">
                <span className="font-semibold truncate">{profile?.firstName} {profile?.lastName}</span>
                <span className="text-xs truncate">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
          <DropdownMenuGroup>
            {profile?.role === 'student' && hasAccess && getNextHigherPlan && (
              <DropdownMenuItem 
                className="hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-green-600 dark:text-green-400 transition-colors cursor-pointer" 
                onClick={handleUpgradePlan}
              >
                <Sparkles className="w-5 h-5" />
                {`Upgrade to ${getNextHigherPlan}`}
              </DropdownMenuItem>
            )}
            
            {profile && hasAccess && (
              <DropdownMenuItem 
                className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer" 
                onClick={handleBilling}
              >
                <CreditCard className="w-5 h-5" />
                {t('billing')}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <UserCircle className="w-5 h-5" />
              <Link href={`/${locale}/profile`} className="w-full">
                {t('profile')}
              </Link>
            </DropdownMenuItem>
            
            {profile?.role === 'student' && profile.hasCompletedOnboarding === false && (
              <DropdownMenuItem 
                className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/${locale}/student/onboarding`)}
              >
                <BookOpen className="w-5 h-5" />
                {t('onboarding')}
              </DropdownMenuItem>
            )}
            
            {profile?.role === 'student' && profile.hasCompletedOnboarding === true && hasAccess && (
              <DropdownMenuItem 
                className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/${locale}/student/dashboard`)}
              >
                <LayoutDashboard className="w-5 h-5" />
                {t('dashboard')}
              </DropdownMenuItem>
            )}
            
            {profile?.role === 'admin' && (
              <DropdownMenuItem 
                className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/${locale}/admin`)}
              >
                <Settings className="w-5 h-5" />
                {t('admin')}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              {t('notifications')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
          <DropdownMenuItem 
            className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer" 
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            {t('sign-out')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Header variant (default)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full hover:scale-105 transition-transform duration-200">
        <Avatar>
          <AvatarImage
            src={profile?.avatarUrl}
            alt={profile?.firstName}
            width={32}
            height={32}
            className="rounded-full"
          />
          <AvatarFallback className="bg-gray-200 dark:bg-gray-600 rounded-full">{avatarFallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-white dark:bg-gray-700 rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56 transition-opacity duration-200" 
        side="bottom" 
        align="end"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
            <Avatar className="rounded-lg w-8 h-8">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.firstName} />
              <AvatarFallback className="bg-gray-200 dark:bg-gray-600 rounded-lg">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1 grid text-sm text-left leading-tight">
              <span className="font-semibold truncate">{profile?.firstName} {profile?.lastName}</span>
              <span className="text-xs truncate">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
        <DropdownMenuGroup>
          {profile?.role === 'student' && hasAccess && getNextHigherPlan && (
            <DropdownMenuItem 
              className="hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-green-600 dark:text-green-400 transition-colors cursor-pointer" 
              onClick={handleUpgradePlan}
            >
              <Sparkles className="w-5 h-5" />
              {`Upgrade to ${getNextHigherPlan}`}
            </DropdownMenuItem>
          )}
          
          {profile && hasAccess && (
            <DropdownMenuItem 
              className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer" 
              onClick={handleBilling}
            >
              <CreditCard className="w-5 h-5" />
              {t('billing')}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <UserCircle className="w-5 h-5" />
            <Link href={`/${locale}/profile`} className="w-full">
              {t('profile')}
            </Link>
          </DropdownMenuItem>
          
          {profile?.role === 'student' && profile.hasCompletedOnboarding === false && (
            <DropdownMenuItem 
              className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => router.push(`/${locale}/student/onboarding`)}
            >
              <BookOpen className="w-5 h-5" />
              {t('onboarding')}
            </DropdownMenuItem>
          )}
          
          {profile?.role === 'student' && profile.hasCompletedOnboarding === true && hasAccess && (
            <DropdownMenuItem 
              className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => router.push(`/${locale}/student/dashboard`)}
            >
              <LayoutDashboard className="w-5 h-5" />
              {t('dashboard')}
            </DropdownMenuItem>
          )}
          
          {profile?.role === 'admin' && (
            <DropdownMenuItem 
              className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => router.push(`/${locale}/admin`)}
            >
              <Settings className="w-5 h-5" />
              {t('admin')}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            {t('notifications')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
        <DropdownMenuItem 
          className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer" 
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          {t('sign-out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 