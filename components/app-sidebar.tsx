"use client"

import * as React from "react"

import {
  GraduationCap,
  Settings2,
  Home,
  Users,
  UserCircle
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import Image from "next/image";
import Link from "next/link";
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import config from "@/config"
import logo from "@/app/icon.png";
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  
  // Navigation items with active state based on current path
  const navItems = [
    {
      title: t('dashboard.title'),
      url: `/${locale}/dashboard`,
      icon: Home,
      isActive: pathname.includes('/dashboard'),
    },
    {
      title: t('classes.title'),
      url: `/${locale}/classes`,
      icon: GraduationCap,
      isActive: pathname.includes('/classes'),
    },
    {
      title: t('teachers.title'),
      url: `/${locale}/teachers`,
      icon: Users,
      isActive: pathname.includes('/teachers'),
    },
    {
      title: t('profile.title'),
      url: `/${locale}/profile`,
      icon: UserCircle,
      isActive: pathname.includes('/profile'),
    },
    {
      title: t('settings.title'),
      url: `/${locale}/settings`,
      icon: Settings2,
      isActive: pathname.includes('/settings'),
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 px-2">
          <Image src={logo} alt={config.appName} width={16} height={16} /> 
          <span className="font-bold text-sm sidebar-expanded-only">{config.appName}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
