"use client"

import * as React from "react"

import {
  GraduationCap,
  Settings2
} from "lucide-react"
import { HourglassMedium, Student } from "@phosphor-icons/react"
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

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: HourglassMedium,
      isActive: true,
    },
    {
      title: "Classes",
      url: "/classes",
      icon: GraduationCap,
    },
    {
      title: "Students",
      url: "/students",
      icon: Student,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2">
          <Image src={logo} alt={config.appName} width={16} height={16} /> 
          <span className="font-bold text-sm">{config.appName}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
