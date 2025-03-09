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
import { useLocale } from "next-intl"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const locale = useLocale();
  
  // Navigation items with active state based on current path
  const navItems = [
    {
      title: "Dashboard",
      url: `/${locale}/dashboard`,
      icon: Home,
      isActive: pathname.includes('/dashboard'),
    },
    {
      title: "Classes",
      url: `/${locale}/classes`,
      icon: GraduationCap,
      isActive: pathname.includes('/classes'),
    },
    {
      title: "Teachers",
      url: `/${locale}/teachers`,
      icon: Users,
      isActive: pathname.includes('/teachers'),
    },
    {
      title: "Profile",
      url: `/${locale}/profile`,
      icon: UserCircle,
      isActive: pathname.includes('/profile'),
    },
    {
      title: "Settings",
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
