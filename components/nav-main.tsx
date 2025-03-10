"use client"

import { type LucideIcon } from "lucide-react"
import { cn } from "@/libs/utils"
import { useTranslations } from "next-intl"

import {
  Collapsible,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const t = useTranslations('shared');
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('platform')}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <Link href={item.url} className="w-full">
                <SidebarMenuButton 
                  tooltip={item.title}
                  className={cn(
                    "transition-colors hover:bg-accent hover:text-accent-foreground",
                    item.isActive && "bg-accent/50 text-green-700 dark:text-green-500 font-bold"
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
