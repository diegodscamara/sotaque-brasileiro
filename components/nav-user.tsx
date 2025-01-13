"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

import Link from "next/link";
import { StudentProfileData } from "@/types/profile"
import { User } from "@supabase/supabase-js"
import apiClient from "@/libs/api"
import config from "@/config"
import { createClient } from "@/libs/supabase/client"
import { useRouter } from "next/navigation";

export function NavUser() {
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const supabase = createClient()
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('students').select('*').eq('id', userData.user?.id)
      setUser(userData.user)
      setProfile(profileData[0])
      setHasAccess(profileData[0].has_access)
    }
    fetchUser()
  }, [supabase])

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
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUpgrade = async () => {
    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          priceId: profile?.package_name === "Explorer" || profile?.package_name === "Enthusiast"
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="rounded-lg w-8 h-8">
                <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                <AvatarFallback className="rounded-lg">{profile?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 grid text-left text-sm leading-tight">
                <span className="font-semibold truncate">{profile?.name}</span>
                <span className="text-xs truncate">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="rounded-lg w-8 h-8">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                  <AvatarFallback className="rounded-lg">{profile?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 grid text-left text-sm leading-tight">
                  <span className="font-semibold truncate">{profile?.name}</span>
                  <span className="text-xs truncate">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleUpgrade} className="cursor-pointer">
                <Sparkles />
                Upgrade to Master
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                <Link href="/profile">
                  Account
                </Link>
              </DropdownMenuItem>
              {hasAccess && <DropdownMenuItem className="cursor-pointer" onClick={handleBilling}>
                <CreditCard />
                Billing
              </DropdownMenuItem>}
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
